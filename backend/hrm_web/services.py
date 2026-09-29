from django.db.models import Sum
from django.utils import timezone
from decimal import Decimal
from .models import (
    EmployeePayrollProfile, Attendance, TaxConfiguration, SalaryComponent, 
    Payslip, PayslipDetail, EMSColleague, PayScale, Invoice
)
import datetime

def calculate_and_generate_payslip(clg_id, month, year):
    try:
        profile = EmployeePayrollProfile.objects.get(employee_id=clg_id)
        employee = EMSColleague.objects.get(clg_id=clg_id)
        
        start_date = datetime.date(year, month, 1)
        
        # EDGE CASE 1: Mid-Month ya Month-End check
        today = timezone.now().date()
        if month == today.month and year == today.year:
            end_date = today
        else:
            if month == 12:
                end_date = datetime.date(year, 12, 31)
            else:
                end_date = datetime.date(year, month + 1, 1) - datetime.timedelta(days=1)

        # EDGE CASE 2: Check if already Approved/Paid (Sirf start date se check hoga)
        existing_payslip = Payslip.objects.filter(
            employee=employee, 
            pay_period_start=start_date
        ).first()

        if existing_payslip and existing_payslip.status in ['APPROVED', 'PAID']:
            return {"error": f"Payslip already {existing_payslip.status}. Cannot re-generate."}

        # ==========================================
        # NEW GROSS PAY CALCULATION (Dynamic PayScale)
        # ==========================================
        employee_role = profile.role
        total_regular_hours = Decimal(0)
        total_overtime_hours = Decimal(0)
        regular_pay = Decimal(0)
        overtime_pay = Decimal(0)
        
        # Shift wise data store karne ke liye (Payslip Detail banane ke liye)
        shift_breakup = {} 

        if profile.pay_type == 'hourly':
            attendances = Attendance.objects.filter(
                employee_id=clg_id,
                attendance_date__month=month,
                attendance_date__year=year,
                is_deleted=0
            ).select_related('shift')
            
            for att in attendances:
                if not att.shift:
                    continue # Agar shift assign nahi hai toh skip
                
                shift_name = att.shift.shift_name
                
                # PayScale table se rate nikaalo
                pay_scale = PayScale.objects.filter(role=employee_role, shift_type=shift_name).first()
                
                # Agar PayScale mein rate mil gaya, toh wo use karo, warna profile ka default hourly_rate use karo
                rate = pay_scale.hourly_rate if pay_scale else (profile.hourly_rate or Decimal(0))
                ot_rate = rate * (profile.overtime_multiplier or Decimal('1.5'))
                
                reg_hrs = att.working_hours or Decimal(0)
                ot_hrs = att.overtime_hours or Decimal(0)
                
                # Calculate pay for this specific day/shift
                day_reg_pay = reg_hrs * rate
                day_ot_pay = ot_hrs * ot_rate
                
                regular_pay += day_reg_pay
                overtime_pay += day_ot_pay
                total_regular_hours += reg_hrs
                total_overtime_hours += ot_hrs
                
                # Store for Breakup
                if shift_name not in shift_breakup:
                    shift_breakup[shift_name] = {"hours": Decimal(0), "pay": Decimal(0)}
                shift_breakup[shift_name]["hours"] += (reg_hrs + ot_hrs)
                shift_breakup[shift_name]["pay"] += (day_reg_pay + day_ot_pay)
                
            base_salary = Decimal(0)
            
        else:
            # Fixed Monthly Salary
            base_salary = profile.monthly_base_salary or Decimal(0)
            regular_pay = base_salary
            overtime_pay = Decimal(0) 
            
        gross_pay = regular_pay + overtime_pay
        
        # ==========================================
        # TAX & DEDUCTIONS CALCULATION
        # ==========================================
        total_tax = Decimal(0)
        country_code = 'UK' if profile.country == 'UK' else 'IE'
        tax_year = "2024-2025" 
        tax_slabs = TaxConfiguration.objects.filter(country=country_code, tax_year=tax_year, tax_component='PAYE').order_by('lower_limit')
        
        for slab in tax_slabs:
            if gross_pay > slab.lower_limit:
                upper_limit = slab.upper_limit if slab.upper_limit is not None else gross_pay
                taxable_in_this_slab = min(gross_pay, upper_limit) - slab.lower_limit
                if taxable_in_this_slab > 0:
                    total_tax += (taxable_in_this_slab * slab.rate_percentage) / Decimal(100)
            else:
                break

        total_deductions = Decimal(0)
        components = SalaryComponent.objects.filter(component_type='DEDUCTION')
        for comp in components:
            if comp.calculation_type == 'FIXED':
                total_deductions += comp.value
            elif comp.calculation_type == 'PERCENTAGE':
                total_deductions += (gross_pay * comp.value) / Decimal(100)

        net_pay = gross_pay - total_tax - total_deductions
        
        # ==========================================
        # SAVE PAYSLIP (Update or Create)
        # ==========================================
        payslip, created = Payslip.objects.update_or_create(
            employee=employee,
            pay_period_start=start_date, # Sirf start date se match hoga
            defaults={
                'pay_period_end': end_date, # Yahan end date update hoga
                'pay_frequency': profile.pay_frequency.upper() if profile.pay_frequency else 'MONTHLY',
                'total_regular_hours': total_regular_hours,
                'total_overtime_hours': total_overtime_hours,
                'hourly_rate': profile.hourly_rate or 0, # Default rate save hogi reference ke liye
                'base_salary': base_salary,
                'regular_pay': regular_pay,
                'overtime_pay': overtime_pay,
                'gross_pay': gross_pay,
                'total_tax_deducted': total_tax,
                'total_other_deductions': total_deductions,
                'net_pay': net_pay,
                'status': 'DRAFT'
            }
        )
        
        # ==========================================
        # SAVE PAYSLIP BREAKUP (Detailed)
        # ==========================================
        payslip.details.all().delete()
        
        # 1. Add Shift wise Pay (Earnings)
        if shift_breakup:
            for shift_name, data in shift_breakup.items():
                if data["pay"] > 0:
                    PayslipDetail.objects.create(
                        payslip=payslip, 
                        component_name=f"Pay for {shift_name} ({data['hours']} hrs)", 
                        amount=data["pay"], 
                        is_added=True
                    )
        elif regular_pay > 0:
            # Agar fixed monthly hai
            PayslipDetail.objects.create(payslip=payslip, component_name="Fixed Monthly Pay", amount=regular_pay, is_added=True)

        # 2. Add Overtime (Agar hourly calculation mein OT hua hai)
        if overtime_pay > 0 and profile.pay_type == 'hourly':
            PayslipDetail.objects.create(payslip=payslip, component_name="Overtime Pay", amount=overtime_pay, is_added=True)
            
        # 3. Add Tax (Deductions)
        if total_tax > 0:
            PayslipDetail.objects.create(payslip=payslip, component_name="Income Tax (PAYE)", amount=total_tax, is_added=False)
            
        # 4. Add Other Deductions
        if total_deductions > 0:
            PayslipDetail.objects.create(payslip=payslip, component_name="Other Deductions", amount=total_deductions, is_added=False)

        # ==========================================
        # AUTO INVOICE FOR CONTRACTORS
        # ==========================================
        if profile.employment_type == 'contractor':
            vat_rate = Decimal('20.00') if profile.country == 'UK' else Decimal('23.00')
            subtotal = net_pay 
            vat_amount = (subtotal * vat_rate) / Decimal(100)
            total_invoice_amount = subtotal + vat_amount
            
            Invoice.objects.update_or_create(
                payslip=payslip,
                defaults={
                    'invoice_number': f"INV-{payslip.id}-{year}{month}",
                    'client_name': f"{employee.clg_first_name} {employee.clg_last_name} (Contractor)",
                    'employee_id': employee.clg_id, # Fixed: Invoice model mein employee_id IntegerField hai
                    'invoice_date': today,
                    'subtotal': subtotal,
                    'vat_rate': vat_rate,
                    'vat_amount': vat_amount,
                    'total_amount': total_invoice_amount,
                    'amount_paid': 0,
                    'balance_due': total_invoice_amount,
                    'status': 'UNPAID'
                }
            )

        return {"status": "success", "message": "Payslip generated successfully", "payslip_id": payslip.id}

    except EmployeePayrollProfile.DoesNotExist:
        return {"error": "Employee payroll profile not found."}
    except Exception as e:
        return {"error": str(e)}