from rest_framework import serializers
from django.utils import timezone
from .models import *
from datetime import datetime, date
from math import radians, sin, cos, sqrt, atan2
from face_auth.models import FaceUser, FaceProfile
#----------------Mayank---------------------------------------------------------------#

# 1. Tax Setup Serializer
class TaxConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxConfiguration
        fields = '__all__'

# 2. Salary Component Setup Serializer
class SalaryComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryComponent
        fields = '__all__'

# 3. Payslip Detail Serializer 
class PayslipDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayslipDetail
        fields = ['id', 'component_name', 'amount', 'is_added']

# 4. Main Payslip Serializer
class PayslipSerializer(serializers.ModelSerializer):
    details = PayslipDetailSerializer(many=True, read_only=True)
    employee_name = serializers.CharField(source='employee.clg_first_name', read_only=True)

    class Meta:
        model = Payslip
        fields = '__all__'

# 5. Generate Payroll Input Serializer 
class GeneratePayrollSerializer(serializers.Serializer):
    employee_id = serializers.IntegerField()
    month = serializers.IntegerField(min_value=1, max_value=12)
    year = serializers.IntegerField()



class CandidateRolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateRoles
        fields = '__all__'

class CandidateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Candidate
        fields = '__all__'


class Moduleserializer(serializers.ModelSerializer):
     class Meta:
          model = Permission_module
          fields = ['module_id', 'name']


class permission_sub_Serializer(serializers.ModelSerializer):
    class Meta:
        model = permission
        fields = '__all__'
        
class ActionSerializer(serializers.Serializer):
    actionId = serializers.IntegerField()
    actionName = serializers.CharField()

class SubmoduleSerializer(serializers.Serializer):  
    submoduleId = serializers.IntegerField()
    submoduleName = serializers.CharField()
    selectedActions = ActionSerializer(many=True)  


class ModuleSerializer(serializers.Serializer):
    moduleId = serializers.IntegerField()
    moduleName = serializers.CharField()
    selectedSubmodules = SubmoduleSerializer(many=True)
class SavePermissionSerializer(serializers.ModelSerializer):
    modules_submodule = serializers.ListField(child=ModuleSerializer())

    class Meta:
        model = agg_save_permissions
        fields = ['id', 'source', 'role', 'modules_submodule']


class AggSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['pk_id', 'department_name']
        
class action_sub_Serializer(serializers.ModelSerializer):
    class Meta:
        model = permission_action
        fields = '__all__'
        

class UserLoginSerializer(serializers.ModelSerializer):
    clg_ref_id = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(style={'input_type': 'password'})
    class Meta:
        model = EMSColleague
        fields = ['clg_ref_id', 'password']

class AddEmployeeBankAccountSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmployeeBankAccount
        fields = "__all__"
        read_only_fields = ("bank_id","employee","added_date","modified_date",)


class EMSAssetAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EMSAssetAllocation
        fields = "__all__"
        read_only_fields = ("allocation_id","colleague","added_date","modify_date",)
        
class EMSColleagueSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True,required=False,allow_blank=True)
    profile = serializers.SerializerMethodField()
    flag = serializers.IntegerField(write_only=True,required=False,default=0)
    bank_account = serializers.SerializerMethodField()
    bank_account_data = AddEmployeeBankAccountSerializer(write_only=True,required=False)
    asset_allocations = serializers.SerializerMethodField()
    asset_allocation_data = EMSAssetAllocationSerializer(write_only=True,required=False)
    face_profile = serializers.SerializerMethodField()

    class Meta:
        model = EMSColleague
        fields = "__all__"
        read_only_fields = ("clg_id","clg_code","clg_ref_id","added_date","modify_date","modify_date_sync",)

    def get_face_profile(self, obj):
        face_user = FaceUser.objects.filter(mobile=obj.clg_mobile_no).first()
        if not face_user:
            return None
        face_profile = FaceProfile.objects.filter(user=face_user,is_active=True).first()
        if not face_profile or not face_profile.registered_image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(face_profile.registered_image.url)
        return face_profile.registered_image.url

    def get_profile(self, obj):
        profile = CandidateDocument.objects.filter(
            colleague_id=obj.clg_id,
            document_type_id=1,
            status=1,
            is_deleted=0
        ).first()

        if not profile or not profile.document:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(profile.document.url)

        return profile.document.url

    def get_bank_account(self, obj):
        bank_account = EmployeeBankAccount.objects.filter(employee=obj,is_deleted=False).first()
        return (AddEmployeeBankAccountSerializer(bank_account).data if bank_account else None)

    def get_asset_allocations(self, obj):
        assets = EMSAssetAllocation.objects.filter(colleague=obj,is_deleted="0")
        return EMSAssetAllocationSerializer(assets,many=True).data


    def create(self, validated_data):
        password = validated_data.pop("password", None) or "11111111"
        validated_data.pop("flag", None)

        instance = EMSColleague.objects.create(**validated_data)

        instance.set_password(password)
        instance.save(update_fields=["password"])

        return instance
    # def update(self, instance, validated_data):
    #     validated_data.pop("password", None)
    #     return super().update(instance, validated_data)


    def update(self, instance, validated_data):

        flag = validated_data.pop("flag",0)
        bank_data = validated_data.pop("bank_account_data",None)
        asset_data = validated_data.pop("asset_allocation_data",None)
        password = validated_data.pop("password",None)

        instance = super().update(instance,validated_data)
        if password:
            instance.set_password(password)
            instance.save(update_fields=["password"])

        if flag == 1 and bank_data:
            bank_account = EmployeeBankAccount.objects.filter(employee=instance,is_deleted=False).first()
            if bank_account:
                for field, value in bank_data.items():
                    setattr(bank_account,field,value)
                bank_account.save()

            else:
                EmployeeBankAccount.objects.create(employee=instance,**bank_data)

        if flag == 2 and asset_data:
            asset_id = asset_data.get("asset")
            asset_allocation = EMSAssetAllocation.objects.filter(colleague=instance,asset=asset_id,is_deleted="0").first()
            if asset_allocation:
                for field, value in asset_data.items():
                    setattr(asset_allocation,field,value)
                asset_allocation.save()

            else:
                EMSAssetAllocation.objects.create(colleague=instance,**asset_data)
        return instance

    # def update(self, instance, validated_data):
    #     flag = validated_data.pop("flag", 0)
    #     bank_data = validated_data.pop("bank_account_data", None)
    #     password = validated_data.pop("password", None)
    #     instance = super().update(instance,validated_data)
    #     if password:
    #         instance.set_password(password)
    #         instance.save(update_fields=["password"])

    #     if flag == 1 and bank_data:
    #         bank_account = EmployeeBankAccount.objects.filter(employee=instance,is_deleted=False).first()
    #         if bank_account:
    #             for field, value in bank_data.items():
    #                 setattr(bank_account, field, value)
    #             bank_account.save()
    #         else:
    #             EmployeeBankAccount.objects.create(employee=instance,**bank_data)

    #     return instance
    


from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned

class SafeSlugRelatedField(serializers.SlugRelatedField):
    """
    Same as SlugRelatedField, but if multiple objects match the slug value,
    picks the most recently created one (highest pk) instead of raising an error.
    """
    def to_internal_value(self, data):
        queryset = self.get_queryset()
        try:
            return queryset.get(**{self.slug_field: data})
        except ObjectDoesNotExist:
            self.fail(
                "does_not_exist",
                slug_name=self.slug_field,
                value=str(data),
            )
        except (TypeError, ValueError):
            self.fail("invalid")
        except MultipleObjectsReturned:
            # take the last (highest pk) match instead of failing
            return queryset.filter(**{self.slug_field: data}).order_by("-pk").first()

class BulkUpdateEMSColleagueSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    profile = serializers.SerializerMethodField()

    clg_group = SafeSlugRelatedField(
        slug_field="gcode",
        queryset=EMSGroup.objects.all(),
        required=False,
        allow_null=True,
    )
    organization = SafeSlugRelatedField(
        slug_field="organization_name",
        queryset=Organization.objects.all(),
        required=False,
        allow_null=True,
    )
    branch = SafeSlugRelatedField(
        slug_field="branch_code",
        queryset=Branch.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = EMSColleague
        fields = "__all__"
        read_only_fields = ("clg_id", "added_date", "modify_date", "modify_date_sync")

    def get_profile(self, obj):
        n = CandidateDocument.objects.filter(colleague=obj.clg_id, document_type=1).last()
        return CandidateDocumentSerializer(n).data

    def create(self, validated_data):
        password = validated_data.pop("password", None) or "111111"
        instance = super().create(validated_data)
        instance.set_password(password)
        instance.save(update_fields=["password"])
        return instance

    def update(self, instance, validated_data):
        validated_data.pop("password", None)
        return super().update(instance, validated_data)


    

class ProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateDocument
        fields = [
            "pk_id",
            "document",
            "document_type",
            "verification_status",
        ]
        read_only_fields = [
            "pk_id",
            "document_type",
            "verification_status",
        ]





    
class DeviceToken_serializer(serializers.ModelSerializer):
    class Meta:
        model=DeviceToken
        fields = ['clg_id','token']


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = ['doc_id', 'document_type']  


class CandidateDocumentSerializer(serializers.ModelSerializer):
    document_type_details = EmployeeDocumentSerializer(source="document_type",read_only=True)
    document_url = serializers.SerializerMethodField()
    class Meta:
        model = CandidateDocument
        fields = ["pk_id","colleague","document_type","document_type_details","document","document_url","verification_status","is_signature_required","remarks",
            "verified_by","verified_date","organization","branch","status","is_deleted","added_by","added_date","modify_by","modify_date",]

        read_only_fields = ["pk_id","added_date","modify_date","document_url",]

    def get_document_url(self, obj):
        request = self.context.get("request")
        if obj.document:
            url = obj.document.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None







class CandidateBulkDocumentSerializer(serializers.Serializer):

    document_type = serializers.IntegerField()

    document = serializers.FileField()

    verification_status = serializers.IntegerField(
        required=False,
        default=0
    )

    is_signature_required = serializers.BooleanField(
        required=False,
        default=False
    )

    remarks = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    def validate_document_type(self, value):
    
        if not DocumentType.objects.filter(doc_id=value).exists():
            raise serializers.ValidationError(
                "Invalid document type."
            )

        return value

    





         
class UserLoginInfoSerializer(serializers.ModelSerializer):

    class Meta:
        model = EMSColleagueLogin
        # fields = ['id', 'clg_id']
        fields = ['clg_ref_id', 'clg_login_time', 'clg_login_type', 'organization', 'branch']

class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = "__all__"
        read_only_fields = ("shift_id", "added_date", "modify_date")


class ShiftRosterSerializer(serializers.ModelSerializer):
    shift_name = serializers.CharField(source='shift.shift_name', read_only=True)
    start_timeslot = serializers.TimeField(source='shift.start_time', read_only=True)
    end_timeslot = serializers.TimeField(source='shift.end_time', read_only=True)
    emp_first_name = serializers.CharField(source='employee.clg_first_name', read_only=True)
    emp_last_name = serializers.CharField(source='employee.clg_last_name', read_only=True)
    class Meta:
        model = ShiftRoster
        fields = ["roster_date", "roster_id", "employee", "emp_first_name", "emp_last_name", "shift", "shift_name",  "month", "year", "is_weekoff", "is_holiday", "remarks", "organization" ,"branch","start_timeslot","end_timeslot"]
        read_only_fields = ("roster_id", "shift_name", "added_date", "modify_date")


class ShiftRosterBulkSerializer(serializers.Serializer):
    employee = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False
    )
    shift = serializers.IntegerField(min_value=1)
    start_date = serializers.DateField()
    end_date = serializers.DateField()

    def validate(self, attrs):

        if attrs["start_date"] > attrs["end_date"]:
            raise serializers.ValidationError({
                "end_date": "End date must be greater than or equal to start date."
            })

        # Remove duplicate employee IDs
        attrs["employee"] = list(set(attrs["employee"]))

        return attrs
    
class LeaveDetailsEmployeeWise(serializers.ModelSerializer):

    class Meta:
        model = EmployeeLeaveBalance
        fields = ['allocated','used','pending','balance']
class LeaveTypeSerializer(serializers.ModelSerializer):

    Leave_Details = serializers.SerializerMethodField()
    class Meta:
        model = LeaveType
        fields = ['leave_type_id','leave_code','leave_name','Leave_Details','yearly_allocation','gender']
        read_only_fields = ("leave_type_id", "added_date", "modify_date")

    def get_Leave_Details(self, obj):
        employee_id = self.context.get('clg_id') 
        abc = EmployeeLeaveBalance.objects.filter(leave_type=obj,employee = employee_id,status = 1,is_deleted = 0).first()
        print("aaabbcc",abc)
        data = LeaveDetailsEmployeeWise(abc).data
        print(data)
        
        data = {
                k: 0 if v is None else round(Decimal(v),2) if isinstance(v, str) else  round(Decimal(v),2)
                for k, v in data.items()
            }
        return data

class LeaveDetailSerializer(serializers.ModelSerializer):
    leave_name = serializers.CharField(source='leave_type.leave_name', read_only=True)
    applied_date = serializers.SerializerMethodField()
    total_days = serializers.SerializerMethodField()

    class Meta:
        model = SingleLeaveEntry
        fields = ['employee','leaveID','leave_type', 'leave_name', 'from_date', 'to_date', 'total_days', 'status','applied_date']

    def get_applied_date(self, obj):

        if isinstance(obj.applied_date, datetime):
            return obj.applied_date.strftime("%d/%m/%Y")
        return None
    def get_total_days(self,obj):
        return float(obj.total_days)
class LeaveBalanceSerializer(serializers.ModelSerializer):
    leave_type_name = serializers.CharField(source='leave_type.leave_type_name', read_only=True)
    allocated = serializers.SerializerMethodField()
    used = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()

    class Meta:
        model = EmployeeLeaveBalance
        fields = ['employee', 'leave_type', 'leave_type_name', 'allocated', 'used', 'balance']

    def decimal_to_float(self, value):
        if value is None:
            return 0.00

        return round(float(value), 2)

    def get_allocated(self, obj):
        return self.decimal_to_float(obj.allocated)

    def get_used(self, obj):
        return self.decimal_to_float(obj.used)

    def get_pending(self, obj):
        return self.decimal_to_float(obj.pending)

    def get_balance(self, obj):
        return self.decimal_to_float(obj.balance)
    
class AssetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCategory
        fields = "__all__"
        read_only_fields = (
            "category_id",
            "added_date",
            "modify_date",
        )


class AssetSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(source="category.category_name", read_only=True)

    class Meta:
        model = Asset
        fields = "__all__"
        read_only_fields = (
            "asset_id",
            "added_date",
            "modify_date",
            "category_name",
        )
class DepartmentSerializer(serializers.ModelSerializer):

    group_count = serializers.IntegerField(read_only=True)
    employee_count = serializers.IntegerField(read_only=True)
    group_names = serializers.SerializerMethodField()
    group_employees = serializers.SerializerMethodField()
    organization_name = serializers.CharField(source="organization.organization_name", read_only=True)
    organization_type = serializers.CharField(source="organization.organization_type", read_only=True)
    class Meta:
        model = Department
        fields = '__all__'

    def get_group_names(self, obj):return list(obj.groups.filter(is_deleted=0, status=1).values_list('ugname',flat=True))
    def get_group_employees(self, obj):
        data = {}

        groups = obj.groups.filter(is_deleted=0, status=1)

        for group in groups:
            employees = EMSColleague.objects.filter(clg_group_id=group.gcode,clg_is_deleted="0", clg_is_active="1")            

            data[group.ugname] = [
            {
                "employee_name": f"{e.clg_first_name or ''} {e.clg_last_name or ''}".strip(),
                "profile_photo":  cd  if (cd := self.document_url(self, e)) else None
            }
            for e in employees ]

        return data
    @staticmethod
    def document_url(self, e):
        request = self.context.get("request")
        obj = CandidateDocument.objects.filter(colleague=e.clg_id, document_type=1).last()
        if obj and obj.document:
            url = obj.document.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

class OrganizationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationDocument
        fields = '__all__'

class OrganizationSerializer(serializers.ModelSerializer):
    documents = OrganizationDocumentSerializer(many=True, read_only=True)
    class Meta:
        model = Organization
        fields = '__all__'
        extra_fields=['documents']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['documents'] = OrganizationDocumentSerializer(instance.documents.all(), many=True).data
        return representation
    
class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

class EMSGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = EMSGroup
        fields = '__all__'

class EmployeeUniformSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeUniform
        fields = "__all__"


class EMSColleagueGetSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    group_name = serializers.CharField(
        source="clg_group.ugname",
        read_only=True,
        allow_null=True,
        default=None
    )
    department_name = serializers.CharField(
        source="clg_group.department.department_name",
        read_only=True,
        allow_null=True,
        default=None
    )
    gcode = serializers.CharField(
        source="clg_group.gcode",
        read_only=True,
        allow_null=True,
        default=None
    )

    class Meta:
        model = EMSColleague
        fields = [
            "clg_id",
            "clg_code",
            "employee_name",
            "group_name",
            "department_name",
            "gcode"
        ]

    def get_employee_name(self, obj):
        name_parts = [
            obj.title,
            obj.clg_first_name,
            obj.clg_mid_name,
            obj.clg_last_name,
        ]

        return " ".join(
            part for part in name_parts if part
        )


class AttendanceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            "employee",
            "attendance_date",
            "first_login",
            "last_logout",
            "remarks",
        ]

    def create(self, validated_data):
        validated_data["attendance_status"] = "present"
        return Attendance.objects.create(**validated_data)


class AttendancePostSerializer(serializers.Serializer):
    employee = serializers.IntegerField(required=True)
    latitude = serializers.FloatField(required=True)
    longitude = serializers.FloatField(required=True)
    remarks = serializers.CharField(required=False, allow_blank=True)

from datetime import datetime, time
class AttendanceGetSerializer(serializers.ModelSerializer):

    department_name = serializers.SerializerMethodField()
    employee_name = serializers.SerializerMethodField()

    employee_code = serializers.CharField(
        source="employee.clg_code",
        read_only=True
    )

    shift_name = serializers.CharField(
        source="shift.shift_name",
        read_only=True
    )

    break_time = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = "__all__"

    def get_department_name(self, obj):
        employee = getattr(obj, "employee", None)

        if not employee:
            return None

        try:
            group = employee.clg_group
        except EMSGroup.DoesNotExist:
            return None

        if not group:
            return None

        department = getattr(group, "department", None)

        if not department:
            return None

        return department.department_name

    def get_employee_name(self, obj):
        employee = getattr(obj, "employee", None)

        if not employee:
            return None

        return f"{employee.clg_first_name or ''} {employee.clg_last_name or ''}".strip()

    def get_break_time(self, obj):
        """
        Calculate total break duration for this employee
        on the attendance date.
        """
        clg_obj = EMSColleague.objects.get(clg_ref_id=obj.employee)
        print(clg_obj.clg_id, "clg obj")

        if not obj.employee or not obj.attendance_date:
            return "00h 00m"

        start_of_day = datetime.combine(
            obj.attendance_date,
            time.min
        )

        end_of_day = datetime.combine(
            obj.attendance_date,
            time.max
        )

        if timezone.is_naive(start_of_day):
            start_of_day = timezone.make_aware(start_of_day)

        if timezone.is_naive(end_of_day):
            end_of_day = timezone.make_aware(end_of_day)

        breaks = EMSBreakDetails.objects.filter(
            employee=clg_obj.clg_id,
            start_break__gte=start_of_day,
            start_break__lte=end_of_day,
            start_break__isnull=False,
            end_break__isnull=False
        )
        print("breaks-----9,", breaks)

        total_seconds = 0

        for break_detail in breaks:
            start = break_detail.start_break
            end = break_detail.end_break

            if start and end and end > start:
                total_seconds += (end - start).total_seconds()

        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)

        return f"{hours:02d}h {minutes:02d}m"

class AttendancePunchSerializer(serializers.ModelSerializer):

    class Meta:
        model = AttendancePunch
        fields = [
            "punch_id",
            "punch_datetime",
            "latitude",
            "longitude",
        ]


class AttendanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            "attendance_status",
            "remarks",
            "is_approved",
            "approved_by",
            "approved_date",
            "first_login",
            "last_logout",
            "clockin_latitude",
            "clockin_longitude",
            "clockout_latitude",
            "clockout_longitude",
            "working_hours",
            "overtime_hours",
            "late_minutes",
            "early_exit_minutes",
        ]


# class BreakDetailsSerializer(serializers.ModelSerializer):

#     breakId = serializers.IntegerField(
#         source="id",
#         read_only=True
#     )

#     breakTypeId = serializers.IntegerField(
#         source="break_type.id",
#         read_only=True,
#         allow_null=True
#     )

#     breakType = serializers.CharField(
#         source="break_type.break_name",
#         read_only=True,
#         allow_null=True
#     )

#     startBreak = serializers.DateTimeField(
#         source="start_break",
#         read_only=True,
#         allow_null=True
#     )

#     endBreak = serializers.DateTimeField(
#         source="end_break",
#         read_only=True,
#         allow_null=True
#     )

#     breakStatus = serializers.SerializerMethodField()

#     breakTime = serializers.SerializerMethodField()

#     class Meta:
#         model = EMSBreakDetails
#         fields = [
#             "breakId",
#             "breakTypeId",
#             "breakType",
#             "startBreak",
#             "endBreak",
#             "breakStatus",
#             "breakTime",
#         ]

#     def get_breakStatus(self, obj):
#         if obj.start_break and obj.end_break:
#             return "completed"
#         elif obj.start_break:
#             return "ongoing"
#         return "not_started"

#     def get_breakTime(self, obj):
#         if not obj.start_break:
#             return "00:00"

#         end_break = obj.end_break or timezone.now()

#         if end_break <= obj.start_break:
#             return "00:00"

#         duration = end_break - obj.start_break

#         total_seconds = int(duration.total_seconds())

#         hours = total_seconds // 3600
#         minutes = (total_seconds % 3600) // 60

#         return f"{hours:02d}:{minutes:02d}"


class BreakDetailsSerializer(serializers.ModelSerializer):
 
    breakId = serializers.IntegerField(
        source="id",
        read_only=True
    )
 
    breakTypeId = serializers.IntegerField(
        source="break_type.id",
        read_only=True,
        allow_null=True
    )
 
    breakType = serializers.CharField(
        source="break_type.break_name",
        read_only=True,
        allow_null=True
    )
 
    startBreak = serializers.DateTimeField(
        source="start_break",
        read_only=True,
        allow_null=True
    )
 
    endBreak = serializers.DateTimeField(
        source="end_break",
        read_only=True,
        allow_null=True
    )
 
    breakStatus = serializers.SerializerMethodField()
    breakTime = serializers.SerializerMethodField()
 
    class Meta:
        model = EMSBreakDetails
        fields = [
            "breakId",
            "breakTypeId",
            "breakType",
            "startBreak",
            "endBreak",
            "breakStatus",
            "breakTime",
        ]
 
    def get_breakStatus(self, obj):
        if obj.start_break and obj.end_break:
            return "completed"
        elif obj.start_break:
            return "ongoing"
        return "not_started"
 
    def get_breakTime(self, obj):
        if not obj.start_break:
            return "00:00"
 
        end_break = obj.end_break or timezone.now()
 
        if end_break <= obj.start_break:
            return "00:00"
 
        duration = end_break - obj.start_break
        total_seconds = int(duration.total_seconds())
 
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
 
        return f"{hours:02d}:{minutes:02d}"
    

class AttendanceDaySerializer(serializers.ModelSerializer):

    shift_name = serializers.CharField(
        source="shift.shift_name",
        read_only=True,
        allow_null=True
    )

    clock_in = serializers.DateTimeField(
        source="first_login",
        read_only=True,
        allow_null=True
    )

    clock_out = serializers.DateTimeField(
        source="last_logout",
        read_only=True,
        allow_null=True
    )

    punch_details = AttendancePunchSerializer(
        source="attendance_punches",
        many=True,
        read_only=True
    )

    # break_details = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            "attendance_date",
            "shift_name",

            "clock_in",
            "clockin_latitude",
            "clockin_longitude",

            "clock_out",
            "clockout_latitude",
            "clockout_longitude",

            "punch_details",
            # "break_details",
        ]

    def get_break_details(self, obj):

        break_obj = EMSBreakDetails.objects.filter(
            employee_id=obj.employee_id
        ).select_related(
            "break_type"
        ).order_by(
            "-id"
        ).first()

        print("LATEST BREAK -----", break_obj)

        # No break record
        if not break_obj:
            return None

        # Only return if the LATEST break is ongoing
        if break_obj.start_break and not break_obj.end_break:
            return BreakDetailsSerializer(break_obj).data

        # Latest break is completed
        return None


class JobOpeningSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobOpening
        fields = '__all__'

class StateSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmsMasState
        fields = ["st_id","st_code","st_name","st_status","stis_deleted",]


class DistrictSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmsMasDistrict
        fields = ["dst_id","dst_code","dst_name","div_id","dst_state","dst_lat","dst_lang","geo_fence_radius","dst_status","dstis_deleted",]



class AmbulanceSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmsIncidenceAmbulance

        fields = [
            "inc_amb_id",
            "inc_ref_id",
            "bk_inc_ref_id",
            "inc_base_month",
            "amb_rto_register_no",
            "amb_district",
            # "ward_id",
            # "ward_name",
            "base_location_id",
            "base_location_dist_id",
            "base_location_name",
            "assigned_time",
            # "amb_pilot_id",/
            # "amb_emt_id",
            "amb_status",
            "amb_type",
            "modify_date_sync",
            "crew_id",
        ]

        read_only_fields = [
            "inc_amb_id",
            "modify_date_sync",
        ]






class IncidentSerializer(serializers.ModelSerializer):

    state = serializers.SerializerMethodField()
    district = serializers.SerializerMethodField()
    ambulances = serializers.SerializerMethodField()

    pickupLocation = serializers.SerializerMethodField()
    pickupAddress = serializers.SerializerMethodField()
    pickupLatitude =  serializers.SerializerMethodField()
    pickupLongitude = serializers.SerializerMethodField()
 
    destinationLocation= serializers.SerializerMethodField()
    destinationAddress= serializers.SerializerMethodField()
    destinationLatitude= serializers.SerializerMethodField()
    destinationLongitude= serializers.SerializerMethodField()
 
    distance= serializers.SerializerMethodField()
    eta = serializers.SerializerMethodField()
    crewRequiredCount= serializers.SerializerMethodField()
    ambNum= serializers.SerializerMethodField()
 
    crewMembers = serializers.SerializerMethodField()
    clg_accepted = serializers.SerializerMethodField()

    class Meta:
        model = EmsIncidence

        fields = ["inc_id","inc_ref_id","bk_inc_ref_id","pickupLocation","pickupAddress","pickupLatitude","pickupLongitude","destinationLocation","destinationAddress","destinationLatitude","destinationLongitude","distance","eta","crewRequiredCount","crewMembers",
                  "inc_state_id","inc_district_id","state","district","inc_wht_three_wrd","inc_caller_id","inc_caller_mobile","inc_caller_name","inc_caller_relation","inc_base_month","inc_patient_cnt","inc_complaint","inc_complaint_other","inc_type","inc_avaya_uniqueid","inc_service","inc_datetime","inc_recive_time","inc_address",
                  "inc_city_id","inc_pincode","inc_lat","inc_long","destination_hospital_id","inc_ero_summary","inc_back_hospital","inc_back_home_address","event_status","schedule_from_time","schedule_to_time","event_name","event_organization_name","termination_reason","termination_reason_other","followup_reason","followup_reason_other","followup_schedule_datetime","inc_dispatch_time",
                  "inc_suggested_amb","inc_duplicate","incis_deleted","followup_status","inc_added_by","inc_thirdparty","inc_system_type","inc_set_amb","inc_pcr_status","pre_inc_ref_id","inc_feedback_status","inc_audit_status","patient_ava_or_not","patient_ava_or_not_reason","CADIncidentID","patient_ava_or_not_other_reason","patient_ava_or_not_remark","inc_at_scene_img","inc_images","inc_ero_file_attached",
                  "inc_video","modify_date_sync","quality_audit_status","closure_data_pass_to_gps","offlinedata_img","offline_pcr_status","inc_modify_by","inc_modify_date","inc_ptn_condition","atnd_ercp_call_status","start_time_at_maryland","ambulances","inc_estimate_cost","ambNum","clg_accepted"]

        read_only_fields = ["inc_id","modify_date_sync","state","district","ambulances",]

    def get_clg_accepted(self, obj):
        user = self.context.get("user")
        n=IncidentAction.objects.filter(user=user, inc_ref_id=obj.inc_ref_id).last()
        if n and n.status == 1:
            return "Accepted"
        elif n and n.status == 2:
            return "Rejected"   
        return None

    def get_pickupLocation(self, obj):
        return obj.inc_address

    def get_pickupAddress(self, obj):
        return obj.inc_address

    def get_pickupLatitude(self, obj):
        # return obj.inc_lat
        return 53.3667

    def get_pickupLongitude(self, obj):
        # return obj.inc_long
        return -7.4963

    def get_destinationLocation(self, obj):
        return obj.inc_address

    def get_destinationAddress(self, obj):
        return obj.inc_address

    def get_destinationLatitude(self, obj):
        return 53.3950
    
    def get_destinationLongitude(self, obj):
        return -7.7186

    def get_distance(self, obj):
        R = 6371.0 
        lat1 = radians(float(self.get_destinationLatitude(obj)))
        lon1 = radians(float(self.get_destinationLongitude(obj)))
        lat2 = radians(float(self.get_pickupLatitude(obj)))
        lon2 = radians(float(self.get_pickupLongitude(obj)))
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = (sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2)
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return R * c
        

    def get_eta(self, obj):
        distance_km = self.get_distance(obj)
        average_speed_kmh = 50.0
        travel_time_hours = distance_km / average_speed_kmh
        travel_time_minutes = travel_time_hours * 60
        return travel_time_minutes

    def get_crewRequiredCount(self, obj):
        n=EmsIncidenceAmbulance.objects.filter(inc_ref_id=obj.inc_ref_id).last()
        if n and n.crew_id:
            return len(n.crew_id)
        return []
    def get_ambNum(self, obj):
        n=EmsIncidenceAmbulance.objects.filter(inc_ref_id=obj.inc_ref_id).last()
        if n and n.amb_rto_register_no:
            return n.amb_rto_register_no
        return None

    # def get_crewMembers(self, obj): 
    #     n=EmsIncidenceAmbulance.objects.filter(inc_ref_id=obj.inc_ref_id).last()
    #     if n and n.crew_id:
    #         return n.crew_id
    #     return []

    def get_crewMembers(self, obj):
        n = EmsIncidenceAmbulance.objects.filter(inc_ref_id=obj.inc_ref_id).last()

        crew_members = []
        if n and n.crew_id:
            for crew_id in n.crew_id:
                try:
                    crew_data = dict(crew_id)
                    clg_id = crew_data.get("id")

                    if not clg_id:
                        continue

                    colleague = EMSColleague.objects.get(clg_id=clg_id)
                    crew_members.append({"id": colleague.clg_id,"name": crew_data.get("name"),"designation": colleague.clg_group.ugname if colleague.clg_group else None})
                except EMSColleague.DoesNotExist:
                    continue

        return crew_members

    def get_state(self, obj):
        state = EmsMasState.objects.filter(st_code=obj.inc_state_id).first()
        if not state:
            return None
        return StateSerializer(state).data

    def get_district(self, obj):
        if not obj.inc_district_id:
            return None
        district = EmsMasDistrict.objects.filter(dst_id=obj.inc_district_id).first()
        if not district:
            return None
        return DistrictSerializer(district).data

    def get_ambulances(self, obj):
        ambulances = EmsIncidenceAmbulance.objects.filter(inc_ref_id=obj.inc_ref_id).last()
        return AmbulanceSerializer(ambulances).data

class IncidentSerializer1(serializers.ModelSerializer):
    # inc_startdate = serializers.SerializerMethodField()
    # inc_endtdate = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    ambNum = serializers.SerializerMethodField()
    class Meta:
        model = EmsIncidence
        fields = ['inc_id','inc_address','inc_ref_id','event_name','inc_estimate_cost','schedule_from_time','schedule_to_time','duration','ambNum']

    def get_ambNum(self, obj):
        n=EmsIncidenceAmbulance.objects.filter(inc_ref_id=obj.inc_ref_id).last()
        if n and n.amb_rto_register_no:
            return n.amb_rto_register_no
        return None
    # def get_inc_startdate(self,obj):
    #     if obj.schedule_from_time:
    #         return obj.schedule_from_time.date()
    #     return None
    # def get_inc_endtdate(self,obj):
    #     if obj.schedule_to_time:
    #         return obj.schedule_to_time.date()
    #     return None
    def get_duration(self, obj):
        if obj.schedule_from_time and obj.schedule_to_time:
            duration = obj.schedule_to_time - obj.schedule_from_time

            total_seconds = int(duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60

            return f"{hours}h {minutes}m"

        return None

class IncidentCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmsIncidence
        fields = "__all__"

        read_only_fields = [
            "inc_id",
            "modify_date_sync",
        ]

    def create(self, validated_data):

        ambulances_data = validated_data.pop(
            "ambulances",
            []
        )

        incident = EmsIncidence.objects.create(
            **validated_data
        )

        for ambulance_data in ambulances_data:

            EmsIncidenceAmbulance.objects.create(
                inc_ref_id=incident.inc_ref_id,
                **ambulance_data
            )

        return incident


class IncidentUpdateSerializer(serializers.ModelSerializer):
    inc_state = serializers.SlugRelatedField(slug_field="st_code",queryset=EmsMasState.objects.all(),required=False)
    inc_district = serializers.PrimaryKeyRelatedField(queryset=EmsMasDistrict.objects.all(),allow_null=True,required=False)

    class Meta:
        model = EmsIncidence
        fields = "__all__"
        read_only_fields = ["inc_id","modify_date_sync",]


class AvailabilitySerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(queryset=EMSColleague.objects.all(),many=False)
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all(),many=False)
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all(),many=False)
    class Meta:
        model = EmployeeAvailability
        fields = ['availability_id', 'employee', 'day', 'status', 'organization', 'branch']


class AvailabilityDetailSerializer(serializers.ModelSerializer):

    availability = serializers.PrimaryKeyRelatedField(queryset=EmployeeAvailability.objects.all(),many=False)
    location = serializers.PrimaryKeyRelatedField(queryset=EmployeeLocation.objects.all(),many=False)

    class Meta:
        model  = EmployeeAvailabilityDetail

        fields = ['availability_detail_id','availability', 'start_time', 'end_time', 'location']

    
    def is_time_slot_available(self, requested_start, requested_end, occupied_slots):

        for start, end in occupied_slots:
            start = datetime.strptime(str(start), "%H:%M:%S")
            end = datetime.strptime(str(end), "%H:%M:%S")

            # if requested_start < end and requested_end > start: #This condition will not allow double entry for same time slot in availability_detail table.
            #     return False
        return True
        
    def validate(self, data):
        st = data['start_time']
        ed = data['end_time']
        st_time = datetime.strptime(str(st), "%H:%M:%S")
        ed_time = datetime.strptime(str(ed), "%H:%M:%S")
        availability_id = data['availability'].availability_id

        occupied_time = EmployeeAvailabilityDetail.objects.filter(availability_id=availability_id)
        occupied_time_slots = []
        for i in occupied_time: #Adding occupied time slots in list so we can pass this list in the function call.
            start_time = i.start_time
            end_time = i.end_time
            occupied_time_slots.append((start_time, end_time))

        is_available_slots = self.is_time_slot_available(st_time, ed_time, occupied_time_slots)
        if is_available_slots == False: 
            raise serializers.ValidationError({"Time Slot Is Already Taken."})
        else:
            return data
    
    def create(self, validated_data):
        availability = validated_data.pop('availability')
        location = validated_data.pop('location')

        validated_data['availability_id'] = availability.availability_id
        validated_data['location_id'] = location.location_id

        pro_loc_details = EmployeeAvailabilityDetail.objects.create(**validated_data)
        pro_loc_details.save(force_insert=False)
        return pro_loc_details 


class EmployeeAvailabilityDetailSerializer(serializers.ModelSerializer):
    availability = serializers.PrimaryKeyRelatedField(queryset=EmployeeAvailability.objects.all(),many=False)
    location = serializers.PrimaryKeyRelatedField(queryset=EmployeeLocation.objects.all(),many=False)

    class Meta:
        model  = EmployeeAvailabilityDetail

        fields = ['availability_detail_id','availability', 'start_time', 'end_time', 'location']



class EmployeeDirectorySerializer(serializers.ModelSerializer):

    Department = serializers.IntegerField(source = 'clg_group.department.pk_id',read_only = True, allow_null = True)
    Department_name = serializers.CharField(source = 'clg_group.department.department_name',read_only = True,allow_null=True)
    status = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = EMSColleague
        fields = ['clg_id','clg_ref_id', 'clg_first_name','clg_mid_name','clg_last_name','organization','branch','role','clg_email','Department','Department_name','status','clg_active_date','clg_joining_date']

    def get_status(self,obj):

        # check on leave
        on_leave = LeaveApplication.objects.filter(employee = obj.clg_id,from_date = timezone.now(),status = "Approved").first()
        if on_leave:
            return "On Leave"
        return "Active" if obj.clg_is_active == 1 else "Inactivate"
    def get_role(self,obj):
        rrll = EMSColleague.objects.filter(clg_id = obj.clg_id,clg_is_deleted=0,clg_is_active=1).first()
        if rrll:
            if rrll.clg_group:
                return rrll.clg_group.ugname 
        return None



class AvailabilitySerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(queryset=EMSColleague.objects.all(),many=False)
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all(),many=False)
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all(),many=False)
    class Meta:
        model = EmployeeAvailability
        fields = ['availability_id', 'employee', 'day', 'status', 'organization', 'branch']

    def validate(self, data):
        return data
    
    def create(self, validated_data):
        employee = validated_data.pop('employee')

        validated_data['employee'] = employee

        loc = EmployeeAvailability.objects.create(**validated_data)
        loc.save(force_insert=False)
        return loc
    
    def update(self, instance, validated_data):
        return instance


class AvailabilityDetailSerializer(serializers.ModelSerializer):

    availability = serializers.PrimaryKeyRelatedField(queryset=EmployeeAvailability.objects.all(),many=False)
    location = serializers.PrimaryKeyRelatedField(queryset=EmployeeLocation.objects.all(),many=False)

    class Meta:
        model  = EmployeeAvailabilityDetail

        fields = ['availability_detail_id','availability', 'start_time', 'end_time', 'location']

    
    def is_time_slot_available(self, requested_start, requested_end, occupied_slots):

        for start, end in occupied_slots:
            start = datetime.strptime(str(start), "%H:%M:%S")
            end = datetime.strptime(str(end), "%H:%M:%S")

            # if requested_start < end and requested_end > start: #This condition will not allow double entry for same time slot in availability_detail table.
            #     return False
        return True
        
    def validate(self, data):
        st = data['start_time']
        ed = data['end_time']
        st_time = datetime.strptime(str(st), "%H:%M:%S")
        ed_time = datetime.strptime(str(ed), "%H:%M:%S")
        availability_id = data['availability'].availability_id

        occupied_time = EmployeeAvailabilityDetail.objects.filter(availability_id=availability_id)
        occupied_time_slots = []
        for i in occupied_time: #Adding occupied time slots in list so we can pass this list in the function call.
            start_time = i.start_time
            end_time = i.end_time
            occupied_time_slots.append((start_time, end_time))

        is_available_slots = self.is_time_slot_available(st_time, ed_time, occupied_time_slots)
        if is_available_slots == False: 
            raise serializers.ValidationError({"Time Slot Is Already Taken."})
        else:
            return data
    
    def create(self, validated_data):
        availability = validated_data.pop('availability')
        location = validated_data.pop('location')

        validated_data['availability_id'] = availability.availability_id
        validated_data['location_id'] = location.location_id

        pro_loc_details = EmployeeAvailabilityDetail.objects.create(**validated_data)
        pro_loc_details.save(force_insert=False)
        return pro_loc_details 


class EmployeeAvailabilityDetailSerializer(serializers.ModelSerializer):
    availability = serializers.PrimaryKeyRelatedField(queryset=EmployeeAvailability.objects.all(),many=False)
    location = serializers.PrimaryKeyRelatedField(queryset=EmployeeLocation.objects.all(),many=False)

    class Meta:
        model  = EmployeeAvailabilityDetail

        fields = ['availability_detail_id','availability', 'start_time', 'end_time', 'location']


class EmployeeLocationDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeLocationDetail
        fields = [ "location_detail_id", "latitude", "longitude", "location_name", "organization", "branch", "status", "is_deleted"]
        read_only_fields = ["location_detail_id"]


class EmployeeLocationSerializer(serializers.ModelSerializer):
    details = EmployeeLocationDetailSerializer(many=True,write_only=True)

    class Meta:
        model = EmployeeLocation
        fields = [ "location_id", "employee", "location_name", "organization", "branch", "status", "is_deleted", "added_by", "details",]
        read_only_fields = ["location_id"]

    def create(self, validated_data):
        details_data = validated_data.pop("details")

        location = EmployeeLocation.objects.create(**validated_data)

        for detail_data in details_data:
            EmployeeLocationDetail.objects.create(
                location=location,
                organization=location.organization,
                branch=location.branch,
                **detail_data
            )

        return location
        

class EMSColleagueSerializerrrrrrrr(serializers.ModelSerializer):
    designation = serializers.CharField(source='clg_designation', allow_null=True)
    branch = serializers.CharField(source="branch_id", read_only=True)
    class Meta:
        model = EMSColleague
        # fields = "__all__"
        fields=['clg_id','clg_ref_id','clg_first_name','clg_mid_name','clg_last_name','organization','branch','clg_email','clg_mobile_no','designation']




class EMSAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = EMSAsset
        fields = "__all__"
        read_only_fields = ("asset_id", "added_date", "modify_date")

    def validate_asset_tag(self, value):
        qs = EMSAsset.objects.filter(asset_tag=value, is_deleted="0")
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Asset tag already exists.")
        return value

    def validate_serial_number(self, value):
        if not value:
            return value
        qs = EMSAsset.objects.filter(serial_number=value, is_deleted="0")
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Serial number already exists.")
        return value


class AllocationListSerializer(serializers.ModelSerializer):
    """Row shape for the table in the screenshot."""
    employee_name = serializers.SerializerMethodField()
    employee_avatar_initials = serializers.SerializerMethodField()
    department = serializers.CharField(source="colleague.clg_group.ugname", read_only=True)
    asset_name = serializers.CharField(source="asset.asset_name", read_only=True)
    asset_tag = serializers.CharField(source="asset.asset_tag", read_only=True)
    serial_number = serializers.CharField(source="asset.serial_number", read_only=True)
    category = serializers.CharField(source="asset.category", read_only=True)

    class Meta:
        model = EMSAssetAllocation
        fields = (
            "allocation_id",
            "employee_name",
            "employee_avatar_initials",
            "asset_name",
            "serial_number",
            "asset_tag",
            "category",
            "verification_status",
            "allocation_status",
            "verified_on",
            "department"
        )

    def get_employee_name(self, obj):
        c = obj.colleague
        parts = [c.clg_first_name, c.clg_last_name]
        return " ".join(p for p in parts if p)

    def get_employee_avatar_initials(self, obj):
        c = obj.colleague
        first = (c.clg_first_name or "")[:1]
        last = (c.clg_last_name or "")[:1]
        return (first + last).upper()


class AssetAllocationCreateSerializer(serializers.ModelSerializer):
    """
    Backs the "Add" modal. Accepts EITHER:
      - asset_id (allocate an existing/available asset), OR
      - new_asset {..EMSAsset fields..} to create-and-allocate in one shot.
    """
    colleague_id = serializers.PrimaryKeyRelatedField(
        source="colleague", queryset=EMSColleague.objects.filter(clg_is_deleted="0")
    )
    asset_id = serializers.PrimaryKeyRelatedField(
        source="asset", queryset=EMSAsset.objects.filter(is_deleted="0", status="available"),
        required=False,
    )
    new_asset = EMSAssetSerializer(required=False)

    class Meta:
        model = EMSAssetAllocation
        fields = (
            "allocation_id",
            "colleague_id",
            "asset_id",
            "new_asset",
            "expected_return_date",
            "condition_at_allocation",
            "remarks",
        )
        read_only_fields = ("allocation_id",)

    def validate(self, attrs):
        if not attrs.get("asset") and not attrs.get("new_asset"):
            raise serializers.ValidationError("Provide either asset_id or new_asset details.")
        if attrs.get("asset") and attrs.get("new_asset"):
            raise serializers.ValidationError("Provide only one of asset_id or new_asset, not both.")
        return attrs

    def create(self, validated_data):
        new_asset_data = validated_data.pop("new_asset", None)
        request = self.context.get("request")
        added_by = getattr(getattr(request, "user", None), "username", None) or "system"

        if new_asset_data:
            asset = EMSAsset.objects.create(
                **new_asset_data, added_by=added_by, status="available"
            )
        else:
            asset = validated_data.pop("asset")

        allocation = EMSAssetAllocation.objects.create(
            colleague=validated_data["colleague"],
            asset=asset,
            expected_return_date=validated_data.get("expected_return_date"),
            condition_at_allocation=validated_data.get("condition_at_allocation") or asset.condition,
            remarks=validated_data.get("remarks"),
            allocation_status="pending",
            verification_status="pending",
            added_by=added_by,
        )
        return allocation

    def to_representation(self, instance):
        return AllocationListSerializer(instance, context=self.context).data


class ValidateAssetTagSerializer(serializers.Serializer):
    asset_tag = serializers.CharField()

    def validate_asset_tag(self, value):
        if EMSAsset.objects.filter(asset_tag=value, is_deleted="0").exists():
            raise serializers.ValidationError("This asset tag is already in use.")
        return value
        



class EmployeeBankAccountSerializer(serializers.ModelSerializer):

    employee_name = serializers.SerializerMethodField()
    employee_ref_id = serializers.CharField(
        source="employee.clg_ref_id",
        read_only=True
    )

    verified_by_name = serializers.SerializerMethodField()
    masked_account_number = serializers.SerializerMethodField()

    class Meta:
        model = EmployeeBankAccount

        fields = [
            "bank_id",
            "employee",
            "employee_name",
            "employee_ref_id",
            "email",
            "bank_name",
            "bank_address",
            "account_number",
            "masked_account_number",
            "account_name",
            "routing_number",
            "account_type",
            "verification_status",
            "verified_by",
            "verified_by_name",
            "verified_on",
            "pay_status",
            "is_deleted",
            "added_by",
            "added_date",
            "modified_by",
            "modified_date",
        ]

        read_only_fields = [
            "bank_id",
            "email",
            "employee_name",
            "employee_ref_id",
            "masked_account_number",
            "verified_by",
            "verified_by_name",
            "verified_on",
            "added_date",
            "modified_date",
        ]

    def get_employee_name(self, obj):
        employee = obj.employee

        return " ".join(
            filter(
                None,
                [
                    employee.clg_first_name,
                    employee.clg_mid_name,
                    employee.clg_last_name,
                ]
            )
        )

    def get_verified_by_name(self, obj):
        if not obj.verified_by:
            return None

        employee = obj.verified_by

        return " ".join(
            filter(
                None,
                [
                    employee.clg_first_name,
                    employee.clg_mid_name,
                    employee.clg_last_name,
                ]
            )
        )

    def get_masked_account_number(self, obj):
        return obj.masked_account_number

    def validate_employee(self, employee):
        if employee.clg_is_deleted == "1":
            raise serializers.ValidationError(
                "Selected employee has been deleted."
            )

        if employee.clg_is_active != 1:
            raise serializers.ValidationError(
                "Selected employee is inactive."
            )

        return employee

    def validate_routing_number(self, value):
        if value:
            value = str(value).strip()

            if not value.isdigit():
                raise serializers.ValidationError(
                    "Routing/Sort code must contain only digits."
                )

            if len(value) != 6:
                raise serializers.ValidationError(
                    "Routing/Sort code must be exactly 6 digits."
                )

        return value

    def validate_account_number(self, value):
        value = str(value).strip()

        if not value:
            raise serializers.ValidationError(
                "Account number is required."
            )

        return value

    def create(self, validated_data):
        employee = validated_data.get("employee")

        if employee:
            validated_data["email"] = employee.clg_email

        return super().create(validated_data)




class LeaveDashBoardSerializer(serializers.ModelSerializer):

    clg_id = serializers.CharField(source = 'employee.clg_id')
    clg_first_name = serializers.CharField(source = 'employee.clg_first_name')
    clg_mid_name = serializers.CharField(source = 'employee.clg_mid_name')
    clg_last_name = serializers.CharField(source = 'employee.clg_last_name')
    leave_type = serializers.CharField(source = 'leave_type.leave_type_id')
    leave_name = serializers.CharField(source = 'leave_type.leave_name')

    class Meta:
        model = SingleLeaveEntry
        fields = ['leaveID','clg_id','clg_first_name','clg_mid_name','clg_last_name','leave_type','leave_name','from_date','to_date','total_days','reason','applied_date','status']


class UpcomingLeavesSerializer(serializers.ModelSerializer):

    clg_first_name = serializers.CharField(source = 'employee.clg_first_name')
    clg_mid_name = serializers.CharField(source = 'employee.clg_mid_name')
    clg_last_name = serializers.CharField(source = 'employee.clg_last_name')
    leave_type = serializers.CharField(source = 'leave_type.leave_type_id')
    leave_name = serializers.CharField(source = 'leave_type.leave_name')

    class Meta:

        model = SingleLeaveEntry
        fields = ['clg_first_name','clg_mid_name','clg_last_name','leave_type','leave_name','from_date','to_date']

class BalanceSerializer(serializers.ModelSerializer):
    clg_id = serializers.CharField(source = 'employee.clg_id')
    leave_name = serializers.CharField(source = 'leave_type.leave_name')
    pending = serializers.SerializerMethodField()
    class Meta:
        model = EmployeeLeaveBalance
        fields = ['clg_id','leave_type','leave_name','used','balance','pending']

    def get_pending(self,obj):
        print("done")
        return LeaveApplication.objects.filter(employee = obj.employee,leave_type = obj.leave_type,status = 'Pending').count()


class LeaveProfileSerializer(serializers.ModelSerializer):

    clg_id = serializers.CharField(source = 'employee.clg_id')
    title = serializers.CharField(source = 'employee.title')
    clg_code = serializers.CharField(source = 'employee.clg_code')
    clg_first_name = serializers.CharField(source = 'employee.clg_first_name')
    clg_mid_name = serializers.CharField(source = 'employee.clg_mid_name')
    clg_last_name = serializers.CharField(source = 'employee.clg_last_name')
    leave_type = serializers.CharField(source = 'leave_type.leave_type_id')
    leave_name = serializers.CharField(source = 'leave_type.leave_name')
    comments = serializers.SerializerMethodField()

    class Meta:
        model = SingleLeaveEntry
        fields = ['clg_id','title','clg_code','clg_first_name','clg_mid_name','clg_last_name','leave_type','leave_name','from_date','to_date','total_days','reason','applied_date','status','comments']

    def get_comments(self,obj):
        all = obj.comments.all()
        return CommentSerializer(all,many = True).data

class CommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = LeaveComment
        fields = '__all__'
class DepartmentSerializerData(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = ['pk_id','department_name']




class EMSBreakTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EMSBreakType
        fields = [
            "id",
            "break_name",
            "break_time"
        ]

class GetShiftSerializer(serializers.ModelSerializer):
    date = serializers.CharField(source = 'roster_date')
    shiftType = serializers.CharField(source = 'shift.shift_name')
    class Meta:
        model = ShiftRoster
        fields = ['date','shiftType']

class AllLeaveTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = LeaveType
        fields = ['leave_type_id','leave_code','leave_name']

class NotificationSerializer(serializers.ModelSerializer):
    leave_type = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = '__all__'

    def get_leave_type(self, obj):
        try:
            return notification_enum(obj.notification_type).name
        except (ValueError, TypeError):
            return None
    def get_logo(self, obj):
        return NOTIFICATION_LOGOS.get(obj.notification_type)


class EmployeeStatusSerializer2(serializers.ModelSerializer):

    status = serializers.CharField(source="employee_status",read_only=True)
    district_id = serializers.IntegerField(source="clg_district_id_id",read_only=True)
    district_name = serializers.CharField(source="clg_district_id.dst_name",read_only=True)

    class Meta:
        model = EMSColleague
        fields = ["clg_id","clg_first_name","clg_last_name","district_id","district_name","status"]


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmsMasState
        fields = '__all__'

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmsMasDistrict
        fields = '__all__'

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmsMasCity
        fields = '__all__'


class InterviewCalendarSerializer(serializers.ModelSerializer):
    candidate_name = serializers.SerializerMethodField()
    interviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = [
            'pk_id',
            'candidate_name',
            'applied_for',
            'interview_date',
            'interview_time',
            'interview_type',
            'interviewer',
            'interviewer_name',
            'interview_status',
        ]

    def get_candidate_name(self, obj):
        return f"{obj.first_name or ''} {obj.last_name or ''}".strip()

    def get_interviewer_name(self, obj):
        if obj.interviewer:
            return f"{obj.interviewer.clg_first_name or ''} {obj.interviewer.clg_last_name or ''}".strip()
        return None


class CandidateApprovalTimelineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Candidate
        fields = [
            'pk_id',
            'recruitment_stage',
            'hr_screening_status',
            'technical_interview_status',
            'final_interview_status',
            'background_check_status',
            'offer_status',
        ]

class ShiftSerializer2(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = ['shift_id','start_time','end_time']


class AttendanceReportSerializer(serializers.Serializer):
    sr_no=serializers.IntegerField()
    first_name=serializers.CharField()
    last_name=serializers.CharField()
    department=serializers.CharField()
    attendance_date=serializers.CharField()
    clock_in=serializers.CharField()
    clock_out=serializers.CharField()
    break_time=serializers.CharField()
    total_hours=serializers.FloatField()
    incident_ref_id=serializers.ListField()
    accepted_ref_id=serializers.ListField()
    rejected_ref_id=serializers.ListField()
    not_performed_ref_id=serializers.ListField()
    total_assigned_incident=serializers.IntegerField()
    accepted=serializers.IntegerField()
    rejected=serializers.IntegerField()
    not_performed=serializers.IntegerField()