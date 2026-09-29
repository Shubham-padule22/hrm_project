from django.contrib import admin
from .models import *

from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField

class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)
 
    class Meta:
        model = EMSColleague
        fields = ('clg_ref_id', 'clg_group', 'clg_first_name', 'clg_mid_name', 'clg_last_name', 'clg_email', 'clg_mobile_no', 'clg_otp', 'clg_otp_time', 'clg_jaesemp_id', 'clg_sap_id', 'clg_designation', 'clg_gender', 'clg_marital_status', 'clg_dob', 'clg_joining_date', 'clg_senior', 'clg_user_type', 'clg_city', 'clg_address', 'clg_photo', 'clg_last_login_time', 'clg_is_active', 'clg_active_date', 'clg_is_assign_to_qa', 'clg_is_alive_time', 'clg_break_type', 'clg_avaya_agentid', 'clg_avaya_extension', 'clg_avaya_passwd', 'clg_token', 'clg_zone', 'thirdparty', 'clg_state_id', 'clg_district_id', 'clg_hosp_id', 'otp', 'otp_count', 'otp_expire_time', 'otp_verification', 'skipotp','clg_is_login', 'clg_is_deleted', 'added_by', 'modify_by')
 
    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2
 
    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user
 
 
 
class UserChangeForm(forms.ModelForm):

    class Meta:
        model = EMSColleague
        fields = '__all__'
    
 
    def clean_password(self):
        return self.initial["password"]
 
 
class UserModelAdmin(BaseUserAdmin):
   
    list_display = ('clg_id', 'clg_ref_id', 'clg_group', 'clg_first_name', 'clg_mid_name', 'clg_last_name', 'clg_email', 'clg_mobile_no', 'clg_otp', 'clg_otp_time', 'clg_jaesemp_id', 'clg_sap_id', 'clg_designation', 'clg_gender', 'clg_marital_status', 'clg_dob', 'clg_joining_date', 'clg_senior', 'clg_user_type', 'clg_city', 'clg_address', 'clg_photo', 'clg_last_login_time', 'clg_is_active', 'clg_active_date', 'clg_is_assign_to_qa', 'clg_is_alive_time', 'clg_break_type', 'clg_avaya_agentid', 'clg_avaya_extension', 'clg_avaya_passwd', 'clg_token', 'clg_zone', 'thirdparty', 'clg_state_id', 'clg_district_id', 'clg_hosp_id', 'otp', 'otp_count', 'otp_expire_time', 'otp_verification', 'skipotp','clg_is_login', 'clg_is_deleted', 'added_by', 'modify_by')
    
    list_filter = ('is_admin',)
    
  
    fieldsets = (
        ('User Credentials', {'fields': ('clg_ref_id', 'password',)}),
        ('Personal info', {'fields': ('clg_group', 'clg_first_name', 'clg_mid_name', 'clg_last_name', 'clg_email', 'clg_mobile_no', 'clg_otp', 'clg_otp_time', 'clg_jaesemp_id', 'clg_sap_id', 'clg_designation', 'clg_gender', 'clg_marital_status', 'clg_dob', 'clg_joining_date', 'clg_senior', 'clg_user_type', 'clg_city', 'clg_address', 'clg_photo', 'clg_last_login_time', 'clg_is_active', 'clg_active_date', 'clg_is_assign_to_qa', 'clg_is_alive_time', 'clg_break_type', 'clg_avaya_agentid', 'clg_avaya_extension', 'clg_avaya_passwd', 'clg_token', 'clg_zone', 'thirdparty', 'clg_state_id', 'clg_district_id', 'clg_hosp_id', 'otp', 'otp_count', 'otp_expire_time', 'otp_verification', 'skipotp','clg_is_login', 'clg_is_deleted', 'added_by', 'modify_by')}),
        ('Permissions', {'fields': ('is_admin',)}),
    )
   
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('clg_ref_id', 'clg_group', 'clg_first_name', 'clg_mid_name', 'clg_last_name', 'clg_email', 'clg_mobile_no', 'clg_otp', 'clg_otp_time', 'clg_jaesemp_id', 'clg_sap_id', 'clg_designation', 'clg_gender', 'clg_marital_status', 'clg_dob', 'clg_joining_date', 'clg_senior', 'clg_user_type', 'clg_city', 'clg_address', 'clg_photo', 'clg_last_login_time', 'clg_is_active', 'clg_active_date', 'clg_is_assign_to_qa', 'clg_is_alive_time', 'clg_break_type', 'clg_avaya_agentid', 'clg_avaya_extension', 'clg_avaya_passwd', 'clg_token', 'clg_zone', 'thirdparty', 'clg_state_id', 'clg_district_id', 'clg_hosp_id', 'otp', 'otp_count', 'otp_expire_time', 'otp_verification', 'skipotp','clg_is_login', 'clg_is_deleted', 'added_by', 'modify_by', 'password1', 'password2'),
        }),
    )
    search_fields = ('clg_ref_id',)
    ordering = ('clg_ref_id', 'clg_id')
    filter_horizontal = ()


# Register your models here.
admin.site.register(EMSColleague, UserModelAdmin)
admin.site.register(Shift)
admin.site.register(ShiftRoster)
admin.site.register(Attendance)
admin.site.register(LeaveType)
admin.site.register(EmployeeLeaveBalance)
admin.site.register(LeaveApplication)
admin.site.register(EMSColleagueLogin)
admin.site.register(EMSGroup)
admin.site.register(EMSThirdParty)
admin.site.register(EmployeeLocation)
admin.site.register(EmployeeLocationDetail)
admin.site.register(EmployeeAvailability)
admin.site.register(EmployeeAvailabilityDetail)
admin.site.register(EmployeePayrollProfile)
admin.site.register(TaxConfiguration)
admin.site.register(SalaryComponent)
admin.site.register(Payslip)
admin.site.register(PayslipDetail)
admin.site.register(Invoice)
admin.site.register(PaymentTransaction)
admin.site.register(Permission_module)
admin.site.register(permission)
admin.site.register(permission_action)
admin.site.register(agg_save_permissions)
admin.site.register(Candidate)
admin.site.register(CandidateRoles)
admin.site.register(Department)
admin.site.register(OrganizationDocument)
admin.site.register(Organization)
admin.site.register(CandidateDocument)
admin.site.register(Branch)
admin.site.register(AssetCategory)
admin.site.register(Asset)
admin.site.register(EmployeeAsset)
admin.site.register(AssetReturn)
admin.site.register(DeviceToken)
admin.site.register(AttendancePunch)
