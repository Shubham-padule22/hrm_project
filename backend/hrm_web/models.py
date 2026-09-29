from django.db import models
from django_enumfield import enum
# Create your models here.
from django.db import models
from decimal import Decimal
from face_auth.models import FaceLoginHistory
from django.contrib.auth.models import(
	BaseUserManager,AbstractBaseUser
)
from django.utils import timezone
from ems_hrm_pro.settings import BASE_URL,MEDIA_URL

class Organization(models.Model):
    pk_id = models.AutoField(primary_key=True)
    organization_name = models.CharField(max_length=255, null=True, blank=True)
    organization_type = models.CharField(max_length=255, null=True, blank=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    license_number = models.CharField(max_length=100, null=True, blank=True)
    legal_name = models.CharField(max_length=255, null=True, blank=True)
    tax_id = models.CharField(max_length=100, null=True, blank=True)
    headquarters = models.TextField(null=True, blank=True)
    phone_number = models.CharField(max_length=30, null=True, blank=True)
    email = models.EmailField(max_length=255, null=True, blank=True)
    website = models.CharField(max_length=255, null=True, blank=True)
    logo_file = models.FileField(upload_to='organization_logos/', null=True, blank=True)
    status = models.IntegerField(default=1, null=True, blank=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = 'ems_hrm_organization'


class OrganizationDocument(models.Model):

    DOCUMENT_STATUS_CHOICES = [('active', 'Active'), ('pending', 'Pending'), ('expired', 'Expired')]

    pk_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    document_name = models.CharField(max_length=255, null=True, blank=True)
    document_number = models.CharField(max_length=100, null=True, blank=True)
    document = models.FileField(upload_to='organization_documents/', null=True, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    document_status = models.CharField(max_length=20, choices=DOCUMENT_STATUS_CHOICES, null=True, blank=True)
    status = models.IntegerField(default=1, null=True, blank=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = 'ems_hrm_organization_documents'

class Branch(models.Model):
    pk_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='branches', null=True, blank=True)
    branch_name = models.CharField(max_length=255, null=True, blank=True)
    branch_code = models.CharField(max_length=50, null=True, blank=True)
    is_main_branch = models.BooleanField(default=0, blank=True, null=True)
    status = models.IntegerField(default=1, null=True, blank=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = 'ems_hrm_branch'


class Department(models.Model):
    pk_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='departments', null=True, blank=True)
    department_name = models.CharField(max_length=255, null=True, blank=True)
    department_code = models.CharField(max_length=50, null=True, blank=True)
    department_head = models.ForeignKey('EMSColleague',db_column="department_head",on_delete=models.SET_NULL,null=True,blank=True)
    annual_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.IntegerField(default=1, null=True, blank=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = 'ems_hrm_department'


class EMSColleagueManager(BaseUserManager):
   
    def create_user(self, clg_ref_id, clg_group, password=None):
 
        """
        Creates and saves a User with the given email, name, tc and password.
        """
        if not clg_ref_id:
            raise ValueError('User must have a reference ID')
 
        user = self.model(
            clg_ref_id = clg_ref_id,
            clg_group = clg_group,
        )
 
        user.set_password(password)
        user.save(using=self._db)
        return user

    # def create_superuser(self, user_username, grp_id, user_name, user_email, user_contact_no, user_is_login, user_is_deleted, user_added_by, user_modified_by, password=None,):
    def create_superuser(self, clg_ref_id, clg_group, password=None):

        """Creates and saves a superuser with the given email, name, tc and password."""
        if not clg_ref_id:
            raise ValueError("Clg ref id is required")

        if clg_group:
            try:
                clg_group = EMSGroup.objects.get(gcode=clg_group)
            except EMSGroup.DoesNotExist:
                raise ValueError(
                    f"EMSGroup with gcode '{clg_group}' does not exist."
                )
        user = self.create_user(
            password=password,
            clg_ref_id=clg_ref_id,
            clg_group=clg_group,
        )
 
        user.is_admin = True
        user.save(using=self._db)
        return user


class EMSColleague(AbstractBaseUser):
    IS_DELETED_CHOICES = (
        ("0", "No"),
        ("1", "Yes"),
    )

    LOGIN_STATUS_CHOICES = (
        ("no", "No"),
        ("yes", "Yes"),
        ("break", "Break"),
    )

    OTP_VERIFICATION_CHOICES = (
        ("1", "Pending"),
        ("2", "Verified"),
    )

    USER_TYPE_CHOICES = (
        ("full_time", "Full Time"),
        ("part_time", "Part Time"),
        ("on_call", "On Call"),
        ("intern", "Intern"),
    )
    

    clg_id = models.AutoField(primary_key=True)
    clg_code = models.CharField( max_length=50, unique=True, blank=True, null=True)

    clg_ref_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    clg_group = models.ForeignKey(
        "EMSGroup",
        db_column="clg_group",
        to_field="gcode",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    # clg_group = models.CharField(max_length=50, blank=True, null=True)

    title = models.CharField(max_length=10, blank=True, null=True)
    clg_first_name = models.CharField(max_length=30, blank=True, null=True)
    clg_mid_name = models.CharField(max_length=30, blank=True, null=True)
    clg_last_name = models.CharField(max_length=30, blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    clg_department_name = models.CharField(max_length=50, null=True, blank=True)
    clg_email = models.EmailField(max_length=50, blank=True, null=True, unique=True)
    clg_mobile_no = models.CharField(max_length=15, blank=True, null=True, unique=True)

    clg_otp = models.CharField(max_length=10, blank=True, null=True)
    clg_otp_time = models.CharField(max_length=20, blank=True, null=True)


    clg_jaesemp_id = models.CharField(max_length=20, blank=True, null=True)
    clg_sap_id = models.CharField(max_length=20, blank=True, null=True)

    clg_designation = models.CharField(max_length=50, blank=True, null=True)
    
    clg_gender = models.CharField(max_length=20, blank=True, null=True)
    clg_marital_status = models.CharField(max_length=20, blank=True, null=True)

    clg_dob = models.DateField(blank=True, null=True)
    clg_joining_date = models.DateField(blank=True, null=True)

    clg_senior = models.CharField(max_length=30, blank=True, null=True)
    clg_user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, blank=True, null=True)

    clg_country = models.CharField(max_length=100, blank=True, null=True)
    postcode = models.CharField(max_length=100, blank=True, null=True)
    clg_eme_contact_name = models.CharField(max_length=200, blank=True, null=True)
    clg_eme_contact_relation = models.CharField(max_length=20, blank=True, null=True)
    clg_eme_contact_number = models.BigIntegerField(blank=True,null=True,)
    clg_eme_contact_address = models.CharField(max_length=200, blank=True, null=True)

    clg_qualification = models.CharField(max_length=100, blank=True, null=True)
    clg_university = models.CharField(max_length=100, blank=True, null=True)
    clg_graduation_year = models.CharField(max_length=20, blank=True, null=True)
    clg_certification = models.CharField(max_length=100, blank=True, null=True)

    clg_current_employer = models.CharField(max_length=100, blank=True, null=True)
    clg_total_experience = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    clg_license_number = models.CharField(max_length=100, blank=True, null=True)
    clg_specialization = models.CharField(max_length=100, blank=True, null=True)

    clg_employment_type = models.CharField(max_length=20, blank=True, null=True)
    clg_pay_type = models.CharField(max_length=20, blank=True, null=True)
    clg_insurance_number = models.CharField(max_length=100, blank=True, null=True)
    clg_shift_type = models.CharField(max_length=20, blank=True, null=True)

    clg_blood_type = models.CharField(max_length=10, blank=True, null=True)
    clg_medical_condition = models.CharField(max_length=100, blank=True, null=True)
    clg_allergies = models.CharField(max_length=100, blank=True, null=True)
    clg_med_specialization = models.CharField(max_length=100, blank=True, null=True)
    clg_medical_insurance_provider = models.CharField(max_length=100, blank=True, null=True)

    clg_shirt_size = models.CharField(max_length=10, blank=True, null=True)
    clg_jacket_size = models.CharField(max_length=10, blank=True, null=True)
    clg_coat_size = models.CharField(max_length=10, blank=True, null=True)
    clg_hat = models.BooleanField(default=False, blank=True, null=True)
    shirt_qty = models.IntegerField(null=True, blank=True)
    coat_qty = models.IntegerField(null=True, blank=True)
    coats = models.CharField(max_length=20, null=True, blank=True)
    epaulettes = models.CharField(max_length=20, null=True, blank=True)
    balmoral_size = models.CharField(max_length=20, null=True, blank=True)
    balmoral_qty = models.IntegerField(null=True, blank=True)
    contract = models.CharField(max_length=50, null=True, blank=True)
    deposit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    uniform_added_date = models.DateTimeField(blank=True, null=True)
    uniform_return = models.BooleanField(default=False, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    clg_candidate_id = models.ForeignKey('Candidate', on_delete=models.SET_NULL,blank=True,null=True,)




    clg_city = models.ForeignKey('EmsMasCity',db_column = "clg_city",on_delete=models.SET_NULL,blank=True,null=True)
    # clg_city = models.CharField(max_length=30, blank=True, null=True)
    clg_address = models.CharField(max_length=100, blank=True, null=True)
    clg_photo = models.CharField(max_length=100, blank=True, null=True)

    clg_last_login_time = models.CharField(max_length=20, blank=True, null=True)

    clg_is_active = models.IntegerField(default=1, blank=True, null=True)

    clg_active_date = models.CharField(max_length=50, blank=True, null=True)

    clg_is_deleted = models.CharField(max_length=1,choices=IS_DELETED_CHOICES,default="0",blank=True,null=True,)

    clg_is_assign_to_qa = models.IntegerField(default=0, blank=True, null=True)

    clg_is_login = models.CharField(max_length=10,choices=LOGIN_STATUS_CHOICES,default="no",blank=True,null=True,)
    clg_is_alive_time = models.CharField(max_length=50, blank=True, null=True)
    clg_break_type = models.CharField(max_length=50, blank=True, null=True)

    clg_avaya_agentid = models.CharField(max_length=50,blank=True,null=True,)

    clg_avaya_extension = models.BigIntegerField(blank=True,null=True,)

    clg_avaya_passwd = models.CharField(max_length=50,blank=True,null=True,)

    clg_token = models.CharField(max_length=500, blank=True, null=True)

    clg_zone = models.CharField(max_length=100, blank=True, null=True)

    # thirdparty = models.ForeignKey(
    #     "EMSThirdParty",
    #     db_column="thirdparty_id",
    #     on_delete=models.SET_NULL,
    #     blank=True,
    #     null=True,)

    thirdparty = models.CharField(max_length=50, blank=True, null=True)
    
    # clg_state_id = models.CharField(max_length=50, blank=True, null=True) 
    clg_state_id = models.ForeignKey("EmsMasState",on_delete=models.SET_NULL,blank=True,null=True)
    # clg_district_id = models.CharField(max_length=50, blank=True, null=True)
    clg_district_id = models.ForeignKey("EmsMasDistrict",db_column = "clg_district_id",on_delete=models.SET_NULL,blank=True,null=True)
    is_admin = models.BooleanField(default=False, blank=True, null=True)
    clg_hosp_id = models.IntegerField(blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    otp = models.IntegerField(blank=True, null=True)
    otp_count = models.IntegerField(blank=True, null=True)

    otp_expire_time = models.DateTimeField(blank=True, null=True)

    otp_verification = models.CharField(max_length=1,choices=OTP_VERIFICATION_CHOICES,blank=True,null=True,)

    skipotp = models.CharField(max_length=10, blank=True, null=True)

    modify_date_sync = models.DateTimeField(blank=True,null=True,)
    user_default_key = models.CharField(max_length=255, null=True, blank=True, db_column='user_default_key')
    reporting_manager = models.ForeignKey("self",db_column="reporting_manager_id",on_delete=models.SET_NULL,blank=True,null=True,related_name="team_members")

    class Meta:
        db_table = "ems_colleague"

    username = None
    email = None
 
    objects = EMSColleagueManager()
 
    # EMAIL_FIELD = 'user_email'
    GROUP_FIELD = 'clg_group'
    EMAIL_FIELD = 'clg_email'
 
    USERNAME_FIELD = 'clg_ref_id'
 
 
    REQUIRED_FIELDS = ['clg_group']
 
    def __str__(self):
        return str(self.clg_ref_id)
 
    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return self.is_admin
 
    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin

    def save(self, *args, **kwargs):
        is_new = self.pk is None

        if is_new:
            # First save to generate clg_id
            super().save(*args, **kwargs)

            update_fields = []

            # Generate employee code
            if not self.clg_code:
                self.clg_code = f"EMP{self.clg_id}"
                update_fields.append("clg_code")

            # Generate reference ID only once
            if not self.clg_ref_id and self.clg_group_id:
                group_name = self.clg_group_id.removeprefix("UG-").lower().capitalize()
                self.clg_ref_id = f"{group_name}-{self.clg_id}"
                update_fields.append("clg_ref_id")

            if update_fields:
                super().save(update_fields=update_fields)

        else:
            # Existing employee
            # Do NOT change clg_ref_id when group changes
            super().save(*args, **kwargs)


class EMSBreakType(models.Model):

    id = models.AutoField(primary_key=True)
    break_name = models.CharField(max_length=100,unique=True)
    break_time = models.IntegerField(blank=True, null=True)
    status = models.IntegerField(default=1,blank=True, null=True)
    added_by = models.CharField(max_length=50,blank=True,null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True,blank=True)
    modify_by = models.CharField(max_length=50,blank=True,null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True,blank=True)

    class Meta:
        db_table = "ems_break_type"

    def __str__(self):
        return self.break_name

class EMSBreakDetails(models.Model):

    id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(EMSColleague,on_delete=models.CASCADE,db_column="employee_id",related_name="break_details")
    break_type = models.ForeignKey(EMSBreakType,on_delete=models.SET_NULL,blank=True,null=True,db_column="break_type_id")
    start_break = models.DateTimeField(blank=True,null=True)
    end_break = models.DateTimeField(blank=True,null=True)
    added_by = models.CharField(max_length=50,blank=True,null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True,blank=True)
    modify_by = models.CharField(max_length=50,blank=True,null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True,blank=True)

    class Meta:
        db_table = "ems_break_details"

    def __str__(self):
        return str(self.id)

class DeviceToken(models.Model):
    clg_id = models.ForeignKey(EMSColleague, on_delete=models.CASCADE, null=True)
    token = models.CharField(max_length=200, null=True)
    is_login=models.BooleanField(default=False,null=False)
    login_count=models.IntegerField(default=0,null=True)
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_device_token"

    def save(self, *args, **kwargs):
        if not self.clg_id:
            self.added_by=self.modify_by
        return super().save(*args, **kwargs)


class Shift(models.Model):
    SHIFT_TYPE_CHOICES = (
        ("fixed", "Fixed"),
        ("rotational", "Rotational"),
        ("flexible", "Flexible"),
    )

    shift_id = models.AutoField(primary_key=True)

    shift_name = models.CharField(max_length=100, blank=True, null=True)
    shift_code = models.CharField(max_length=20, blank=True, null=True)
    shift_type = models.CharField(max_length=20, choices=SHIFT_TYPE_CHOICES, blank=True, null=True)

    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)

    break_duration = models.IntegerField(blank=True, null=True)
    grace_in_time = models.IntegerField(blank=True, null=True)
    grace_out_time = models.IntegerField(blank=True, null=True)

    minimum_working_hours = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    is_night_shift = models.IntegerField(default=0, blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_shift"

    def __str__(self):
        return self.shift_name or ""



class ShiftRoster(models.Model):
    roster_id = models.AutoField(primary_key=True)

    employee = models.ForeignKey(
        EMSColleague,
        db_column="clg_id",
        on_delete=models.CASCADE,
        related_name="shift_rosters",
        blank=True,
        null=True,
    )

    shift = models.ForeignKey(
        Shift,
        db_column="shift_id",
        on_delete=models.CASCADE,
        related_name="rosters",
        blank=True,
        null=True,
    )

    roster_date = models.DateField(blank=True, null=True)

    week_number = models.IntegerField(blank=True, null=True)
    month = models.IntegerField(blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)

    is_weekoff = models.IntegerField(default=0, blank=True, null=True)
    is_holiday = models.IntegerField(default=0, blank=True, null=True)

    remarks = models.TextField(blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_shift_roster"
        # unique_together = ("employee", "roster_date")

    def __str__(self):
        return f"{self.employee} - {self.roster_date}"



class Attendance(models.Model):
    STATUS_CHOICES = (
        ("present", "Present"),
        ("absent", "Absent"),
        ("half_day", "Half Day"),
        ("leave", "Leave"),
        ("holiday", "Holiday"),
        ("weekoff", "Week Off"),
    )

    APPROVAL_STATUS_CHOICES = (
    ("pending", "Pending"),
    ("approved", "Approved"),
    ("rejected", "Rejected"),)

    attendance_id = models.AutoField(primary_key=True)

    employee = models.ForeignKey(
        EMSColleague,
        db_column="clg_id",
        on_delete=models.CASCADE,
        related_name="attendance",
        blank=True,
        null=True,
    )

    shift = models.ForeignKey(
        Shift,
        db_column="shift_id",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    attendance_date = models.DateField(blank=True, null=True)

    first_login = models.DateTimeField(blank=True, null=True)
    clockin_latitude = models.FloatField(blank=True, null=True)
    clockin_longitude = models.FloatField(blank=True, null=True)
    last_logout = models.DateTimeField(blank=True, null=True)
    clockout_latitude = models.FloatField(blank=True, null=True)
    clockout_longitude = models.FloatField(blank=True, null=True)
    working_hours = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    late_minutes = models.IntegerField(blank=True, null=True)
    early_exit_minutes = models.IntegerField(blank=True, null=True)

    attendance_status = models.CharField(max_length=20, choices=STATUS_CHOICES, blank=True, null=True)

    remarks = models.TextField(blank=True, null=True)

    face_record_history = models.ForeignKey(
        FaceLoginHistory,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    is_approved = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default="pending", blank=True, null=True,)
    approved_by = models.ForeignKey(
        EMSColleague,
        db_column="approved_by",
        on_delete=models.SET_NULL,
        related_name="approved_attendance",
        blank=True,
        null=True,
    )
    approved_date = models.DateTimeField(blank=True, null=True)
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_attendance"
        # unique_together = ("employee", "attendance_date")

    def __str__(self):
        return f"{self.employee} - {self.attendance_date}"


class AttendancePunch(models.Model):

    punch_id = models.AutoField(primary_key=True)

    attendance = models.ForeignKey(
        Attendance,
        db_column="attendance_id",
        on_delete=models.CASCADE,
        related_name="attendance_punches",
        blank=True,
        null=True,
    )

    employee = models.ForeignKey(
        EMSColleague,
        db_column="clg_id",
        on_delete=models.CASCADE,
        related_name="attendance_punches",
        blank=True,
        null=True,
    )

    punch_datetime = models.DateTimeField(
        blank=True,
        null=True,
    )

    latitude = models.FloatField(
        blank=True,
        null=True,
    )

    longitude = models.FloatField(
        blank=True,
        null=True,
    )

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(
        default=1,
        blank=True,
        null=True,
    )

    is_deleted = models.IntegerField(
        default=0,
        blank=True,
        null=True,
    )

    added_by = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    added_date = models.DateTimeField(
        auto_now_add=True,
        null=True,
        blank=True,
    )

    modify_by = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    modify_date = models.DateTimeField(
        auto_now=True,
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "ems_hrm_attendance_punch"
        ordering = ["punch_datetime"]


class LeaveType(models.Model):

    leave_type_id = models.AutoField(primary_key=True)

    leave_code = models.CharField(max_length=20, blank=True, null=True)
    leave_name = models.CharField(max_length=100, blank=True, null=True)

    yearly_allocation = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    carry_forward = models.IntegerField(blank=True, null=True)

    max_carry_forward = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    encashment_allowed = models.IntegerField(blank=True, null=True)

    sandwich_rule = models.IntegerField(blank=True, null=True)

    gender = models.CharField(max_length=20, blank=True, null=True)

    description = models.TextField(blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_leave_type"



class EmployeeLeaveBalance(models.Model):

    balance_id = models.AutoField(primary_key=True)

    employee = models.ForeignKey(
        EMSColleague,
        db_column="clg_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    leave_type = models.ForeignKey(
        LeaveType,
        db_column="leave_type_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    year = models.IntegerField(blank=True, null=True)

    allocated = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    used = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    pending = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    balance = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_leave_balance"


class day_choices(enum.Enum):
    FULL_DAY = 1
    FIRST_HALF = 2
    SECOND_HALF = 3

class STATUS(enum.Enum):
    Pending = 1
    Approved = 2
    Rejected = 3

class SingleLeaveEntry(models.Model):

    leaveID = models.AutoField(primary_key=True)
    employee = models.ForeignKey(EMSColleague,db_column="clg_id",on_delete=models.CASCADE,blank=True,null=True,)
    leave_type = models.ForeignKey(LeaveType,db_column="leave_type_id",on_delete=models.CASCADE,blank=True,null=True,)

    from_date = models.DateField(blank=True, null=True)
    to_date = models.DateField(blank=True, null=True)

    total_days = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    full_or_half = enum.EnumField(day_choices, blank=True, null=True)

    reason = models.TextField(blank=True, null=True)

    organization = models.ForeignKey(Organization,on_delete=models.SET_NULL,blank=True,null=True,)
    branch = models.ForeignKey(Branch,on_delete=models.SET_NULL,blank=True,null=True,)

    status = enum.EnumField(STATUS, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    is_dlted_remark = models.TextField(blank=True, null=True)

    applied_date = models.DateTimeField(blank=True, null=True)

    approved_by = models.ForeignKey(EMSColleague,db_column="approved_by",on_delete=models.SET_NULL,related_name="approved_leave",blank=True,null=True,)
    approved_date = models.DateTimeField(blank=True, null=True)
    leave_document = models.FileField(upload_to='leave_documents/',null=True,blank=True)

    remarks = models.TextField(blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_single_leave_entry"

class LeaveApplication(models.Model):

    STATUS = (
        ("Pending","Pending"),
        ("Approved","Approved"),
        ("Rejected","Rejected"),
        ("Cancelled","Cancelled"),
    )

    leave_id = models.AutoField(primary_key=True)

    employee = models.ForeignKey(
        EMSColleague,
        db_column="clg_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    leave_type = models.ForeignKey(
        LeaveType,
        db_column="leave_type_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    from_date = models.DateField(blank=True, null=True)
    to_date = models.DateField(blank=True, null=True)

    total_days = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    full_or_half = enum.EnumField(day_choices, blank=True, null=True)

    reason = models.TextField(blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.CharField(max_length=20, choices=STATUS, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    applied_date = models.DateTimeField(blank=True, null=True)

    approved_by = models.ForeignKey(
        EMSColleague,
        db_column="approved_by",
        on_delete=models.SET_NULL,
        related_name="approved_leaves",
        blank=True,
        null=True,
    )
    approved_date = models.DateTimeField(blank=True, null=True)

    remarks = models.TextField(blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    leaveID = models.ForeignKey(SingleLeaveEntry,db_column="leaveID",on_delete=models.SET_NULL,related_name="approved_leave",blank=True,null=True,)

    class Meta:
        db_table = "ems_hrm_leave_application"



class EMSColleagueLogin(models.Model):
    LOGIN_TYPE_CHOICES = (
        ("login", "Login"),
        ("break", "Break"),
    )

    id = models.AutoField(primary_key=True)

    # If you have EMSColleague model, you can use ForeignKey instead.
    clg_ref_id = models.ForeignKey(EMSColleague,to_field="clg_ref_id",db_column="clg_ref_id",on_delete=models.CASCADE,)
    # clg_ref_id = models.CharField(max_length=50,blank=True,null=True,)

    clg_login_time = models.DateTimeField(blank=True,null=True,)
    clg_logout_time = models.DateTimeField(blank=True,null=True,)
    clg_last_login_time = models.CharField(max_length=20,blank=True,null=True,)
    clg_login_type = models.CharField(max_length=10,choices=LOGIN_TYPE_CHOICES,blank=True,null=True,)
    clg_is_alive_time = models.CharField(max_length=50,blank=True,null=True,)
    clg_base_month = models.IntegerField(blank=True,null=True,)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    device_os_name = models.CharField(max_length=150, blank=True,null=True)
    status = models.CharField(default=1,max_length=250, blank=True, null=True)
    is_deleted = models.IntegerField(default=0,blank=True,null=True,)

    class Meta:
        db_table = "ems_clg_logins"

    def __str__(self):
        return f"{self.clg_ref_id or ''} - {self.clg_login_type or ''}"



class EMSGroup(models.Model):
    GROUP_LEVEL_CHOICES = (
        ("primary", "Primary"),
        ("secondary", "Secondary"),
    )

    gid = models.AutoField(primary_key=True)
    ugname = models.CharField(max_length=300, blank=True, null=True)
    gcode = models.CharField(max_length=50, blank=True, null=True, unique=True)
    glevel = models.CharField(max_length=10, choices=GROUP_LEVEL_CHOICES, blank=True, null=True)
    department = models.ForeignKey('Department', on_delete=models.CASCADE, related_name='groups', null=True, blank=True)
    g_type_level = models.IntegerField(blank=True, null=True)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.CharField(default=1,max_length=250, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    gparent = models.CharField(max_length=30, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    modify_date_sync = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "ems_mas_groups"

    def __str__(self):
        return self.ugname or ""



class EMSThirdParty(models.Model):
    STATUS_CHOICES = (
        ("0", "Active"),
        ("1", "Inactive"),
    )

    thirdparty_id = models.AutoField(primary_key=True)
    thirdparty_name = models.CharField(max_length=20, blank=True, null=True)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default="0", blank=True, null=True, help_text="Active/Inactive")
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_mas_thirdparty"

    def __str__(self):
        return self.thirdparty_name or ""



class EmployeeLocation(models.Model):
    location_id = models.AutoField(primary_key=True)

    employee = models.ForeignKey(
        EMSColleague,
        db_column="clg_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    location_name = models.CharField(max_length=100, blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_employee_location"


class EmployeeLocationDetail(models.Model):
    location_detail_id = models.AutoField(primary_key=True)

    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    location_name = models.TextField(blank=True, null=True)

    location = models.ForeignKey(
        EmployeeLocation,
        db_column="location_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_employee_location_details"



class EmployeeAvailability(models.Model):
    availability_id = models.AutoField(primary_key=True)

    employee = models.ForeignKey(
        EMSColleague,
        db_column="clg_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    day = models.IntegerField(blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_employee_availability"



class EmployeeAvailabilityDetail(models.Model):
    availability_detail_id = models.AutoField(primary_key=True)

    availability = models.ForeignKey(
        EmployeeAvailability,
        db_column="availability_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    employee = models.ForeignKey(
        EMSColleague,
        db_column="clg_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)

    location = models.ForeignKey(
        EmployeeLocation,
        db_column="location_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_employee_availability_details"



class PayScale(models.Model):
    """Role and Shift wise hourly rates"""
    ROLE_CHOICES = [
        ('Paramedic', 'Paramedic'),
        ('Nurse', 'Nurse'),
        ('EMT', 'EMT'),
        ('FREC 4', 'FREC 4'),
        ('ACA', 'ACA'),
        ('FAD', 'First Aid Driver (FAD)'),
        ('FA FREC', 'FA FREC/Plus'),
    ]
    SHIFT_TYPE_CHOICES = [
        ('PTS', 'PTS'),
        ('Nights', 'Nights'),
        ('Events', 'Events'),
    ]
    
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    shift_type = models.CharField(max_length=20, choices=SHIFT_TYPE_CHOICES)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    
    class Meta:
        unique_together = ('role', 'shift_type')

    def __str__(self):
        return f"{self.role} - {self.shift_type} - £{self.hourly_rate}"

class EmployeePayrollProfile(models.Model):
    COUNTRY_CHOICES = (
        ("UK", "United Kingdom"),
        ("Ireland", "Ireland"),
    )

    EMPLOYMENT_TYPE_CHOICES = (
        ("full_time", "Full Time"),
        ("part_time", "Part Time"),
        ("contractor", "Contractor"),
    )

    PAY_FREQUENCY_CHOICES = (
        ("monthly", "Monthly"),
        ("weekly", "Weekly"),
        ("bi_weekly", "Bi-Weekly"),
    )

    PAY_TYPE_CHOICES = (
        ("hourly", "Hourly"),
        ("fixed_monthly", "Fixed Monthly"),
    )

    employment_id = models.AutoField(primary_key=True)

    employee = models.ForeignKey(
        EMSColleague,
        db_column="clg_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)

    country = models.CharField(max_length=20, choices=COUNTRY_CHOICES, blank=True, null=True)

    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, blank=True, null=True)

    pay_frequency = models.CharField(max_length=20, choices=PAY_FREQUENCY_CHOICES, blank=True, null=True)

    pay_type = models.CharField(max_length=20, choices=PAY_TYPE_CHOICES, blank=True, null=True)

    role = models.CharField(
        max_length=50, 
        choices=PayScale.ROLE_CHOICES, # PayScale wale roles yahan aayenge
        blank=True, 
        null=True,
        help_text="Select Role for Pay Scale Calculation"
    )

    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    monthly_base_salary = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    overtime_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.50, blank=True, null=True)

    tax_code = models.CharField(max_length=30, blank=True, null=True)

    national_insurance_number = models.CharField(max_length=30, blank=True, null=True)

    pps_number = models.CharField(max_length=30, blank=True, null=True) # Personal Public Service Number (National Insurance Number equivalent in Ireland)

    joining_date = models.DateField(blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_employee_payroll_profile"

    def __str__(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()



#-------------------------------payroll module-----------------------------------Mayank---


# ==========================================================
# 1. TAX MANAGEMENT (UK & IRELAND Rules)
# ==========================================================
class TaxConfiguration(models.Model):
    """UK and Ireland  Tax Slabs"""
    COUNTRY_CHOICES = [
        ('UK', 'United Kingdom'),
        ('IE', 'Ireland'),
    ]
    TAX_COMPONENT_CHOICES = [
        ('PAYE', 'Income Tax (PAYE)'),
        ('NIC', 'National Insurance (UK)'),
        ('PRSI', 'PRSI (Ireland)'),
        ('USC', 'USC (Ireland)'),
    ]

    country = models.CharField(max_length=2, choices=COUNTRY_CHOICES)
    tax_component = models.CharField(max_length=10, choices=TAX_COMPONENT_CHOICES)
    tax_year = models.CharField(max_length=10, default="2024-2025") # UK ka tax year April se April hota hai
    lower_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    upper_limit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True) # Null means infinite limit
    rate_percentage = models.DecimalField(max_digits=5, decimal_places=2) # e.g., 20.00, 40.00

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    class Meta:
        db_table = "ems_hrm_tax_configuration"
        unique_together = ('country', 'tax_component', 'tax_year', 'lower_limit') 

    def __str__(self):
        return f"{self.country} - {self.tax_component} ({self.tax_year})"


# ==========================================================
# 2. SALARY BREAKUP COMPONENTS (Allowances & Deductions)
# ==========================================================
class SalaryComponent(models.Model):
    """Salary ke kis hisse par kya lagega (Travel, Pension, Medical etc.)"""
    COMPONENT_TYPE_CHOICES = [
        ('EARNING', 'Earning'),
        ('DEDUCTION', 'Deduction'),
    ]
    CALCULATION_TYPE_CHOICES = [
        ('FIXED', 'Fixed Amount'),
        ('PERCENTAGE', 'Percentage of Basic/Gross'),
    ]

    name = models.CharField(max_length=100, unique=True) # e.g., "Travel Allowance", "Pension Contribution"
    component_type = models.CharField(max_length=10, choices=COMPONENT_TYPE_CHOICES)
    calculation_type = models.CharField(max_length=15, choices=CALCULATION_TYPE_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=2) # Fixed amount or Percentage value
    is_taxable = models.BooleanField(default=False, help_text="Agar True hai toh is earning par tax lagega")

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_salary_component"

    def __str__(self):
        return f"{self.name} ({self.component_type})"


# ==========================================================
# 3. PAYSLIP (Main Calculation Table)
# ==========================================================
class Payslip(models.Model):
    """Har employee ka monthly/weekly salary slip"""
    PAY_FREQUENCY_CHOICES = [
        ('WEEKLY', 'Weekly'),
        ('BI_WEEKLY', 'Bi-Weekly'),
        ('MONTHLY', 'Monthly'),
    ]
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('APPROVED', 'Approved'),
        ('PAID', 'Paid'),
    ]

    employee_id = models.ForeignKey('EMSColleague', db_column='clg_id', on_delete=models.CASCADE, related_name='invoices', null=True, blank=True)
    
    pay_frequency = models.CharField(max_length=10, choices=PAY_FREQUENCY_CHOICES)
    pay_period_start = models.DateField()
    pay_period_end = models.DateField()
    
    total_regular_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    total_overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    overtime_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0) # Agar monthly fixed hai
    
    # Calculated Amounts
    regular_pay = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    overtime_pay = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gross_pay = models.DecimalField(max_digits=12, decimal_places=2, default=0) # Total kamai
    
    # Taxes & Deductions
    total_tax_deducted = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0) # Pension etc.
    
    # Final Amount
    net_pay = models.DecimalField(max_digits=12, decimal_places=2, default=0) # In-hand salary
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='DRAFT')
    generated_on = models.DateTimeField(auto_now_add=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_payslip"
        

    def __str__(self):
        return f"Payslip - Emp: {self.employee_id} ({self.pay_period_start} to {self.pay_period_end})"


# ==========================================================
# 4. PAYSLIP BREAKUP (Line items for transparency)
# ==========================================================
class PayslipDetail(models.Model):
    """Payslip ke andar kis hisse ka kitna paisa lagaa (Audit/Transparency ke liye)"""
    payslip = models.ForeignKey(Payslip, related_name='details', on_delete=models.CASCADE)
    component_name = models.CharField(max_length=100) # e.g., "Basic Pay", "PAYE Tax", "Pension"
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_added = models.BooleanField(default=True) # True = Earning, False = Deduction
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_payslip_detail"
        

    def __str__(self):
        return f"{self.payslip.id} - {self.component_name}: {self.amount}"


# ==========================================================
# 5. INVOICE & PAYMENT (Future Proof for Payment Gateway)
# ==========================================================
class Invoice(models.Model):
    """Agency ya Client ko bhejne ke liye invoice"""
    INVOICE_STATUS_CHOICES = [
        ('UNPAID', 'Unpaid'),
        ('PARTIALLY_PAID', 'Partially Paid'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
    ]
    
    invoice_number = models.CharField(max_length=50, unique=True)
    client_name = models.CharField(max_length=200)
    employee_id = models.PositiveIntegerField(null=True, blank=True) # Kis employee ke against bill gaya
    payslip = models.ForeignKey(Payslip, null=True, blank=True, on_delete=models.SET_NULL)
    
    invoice_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    
    # Amounts
    subtotal = models.DecimalField(max_digits=12, decimal_places=2) # 
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=20.00) # UK 20%, IE 23%
    vat_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2) # Subtotal + VAT
    
    # Payment Tracking
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=INVOICE_STATUS_CHOICES, default='UNPAID')
    
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "ems_hrm_invoice"
        
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.client_name}"


# ==========================================================
# 6. PAYMENT GATEWAY LOG (Future ke liye)
# ==========================================================
class PaymentTransaction(models.Model):
    """Agar Stripe/PayPal add karo future mein, toh payment records yahan rahenge"""
    PAYMENT_METHOD_CHOICES = [
        ('STRIPE', 'Stripe'),
        ('PAYPAL', 'PayPal'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('MANUAL', 'Manual Cash/Cheque'),
    ]
    
    invoice = models.ForeignKey(Invoice, related_name='transactions', on_delete=models.CASCADE)
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True) # Gateway 
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    is_success = models.BooleanField(default=False)
    
    # Extra metadata 
    raw_response = models.JSONField(null=True, blank=True) 
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_payment_transaction"

    def __str__(self):
        return f"Payment {self.amount} for Invoice {self.invoice.invoice_number}"




#-------------------------------Permission module -------------------Mayank----------------

from django_enumfield import enum

# Create your models here.


class status_enum(enum.Enum):
	Active = 1
	Inactive = 2
	Delete = 3
	__default__ = Active

class status_p(enum.Enum):
    NO = 0
    YES = 1


class Permission_module(models.Model):
    module_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=250, null=True)
    # Source_id = models.ForeignKey("DMS_Department", on_delete=models.CASCADE,null = True)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_permission_module"

    def __str__(self):
        return self.name

    
class permission(models.Model):
    Permission_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    module = models.ForeignKey("Permission_module", on_delete=models.CASCADE,null = True)
    # source =models.ForeignKey('agg_source',on_delete=models.CASCADE,null=True)
    # source =models.ForeignKey('DMS_Department',on_delete=models.CASCADE,null=True)
    # guard_name = models.CharField(max_length=255)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_permission"

    def __str__(self):
        return self.name     
    
    
class permission_action(models.Model):
    action_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    sub_module = models.ForeignKey("permission", on_delete=models.CASCADE,null = True)
    # source =models.ForeignKey('agg_source',on_delete=models.CASCADE,null=True)
    # guard_name = models.CharField(max_length=255)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_permission_action"

    def __str__(self):
        return self.name     

      


class agg_save_permissions(models.Model):
    id = models.AutoField(primary_key=True)
    # source =models.ForeignKey('DMS_Department',on_delete=models.CASCADE,null=True)
    source =models.ForeignKey('Department',on_delete=models.CASCADE,null=True)
    role = models.ForeignKey('EMSGroup',on_delete=models.CASCADE,null=False)
    modules_submodule = models.JSONField(null=True)
    # modules = models.ForeignKey('Permission_module',on_delete=models.CASCADE,null=True)
    # sub_module = models.ManyToManyField('Permission', related_name='roles', blank=True)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_agg_save_permissions"


# --------------kirti-------------------
class CandidateRoles(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=100, null=True, blank=True)
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)

class Candidate(models.Model):
    RECRUITMENT_STAGE_CHOICES = [('applied', 'Applied'),('hr_screening', 'HR Screening'),('technical_interview', 'Technical Interview'),('final_interview', 'Final Interview'),('background_check', 'Background Check'),('offer_approval', 'Offer Approval'),('selected', 'Selected'),('rejected', 'Rejected'),]
    APPROVAL_STATUS_CHOICES = [('pending', 'Pending'),('waiting', 'Waiting'),('in_progress', 'In Progress'),('approved', 'Approved'),('rejected', 'Rejected'),('completed', 'Completed'),]
    INTERVIEW_TYPE_CHOICES = [('hr', 'HR Interview'),('technical', 'Technical Interview'),('final', 'Final Interview'),]
    GENDER_CHOICES = [('male', 'Male'), ('female', 'Female'), ('other', 'Other')]
    MARITAL_STATUS_CHOICES = [('single', 'Single'), ('married', 'Married'), ('divorced', 'Divorced'), ('widowed', 'Widowed')]
    APPLICATION_STATUS_CHOICES = [('application_submitted', 'Application Submitted'), ('under_review', 'Under Review'), ('interview_scheduled', 'Interview Scheduled'), ('selected', 'Selected'), ('documents_pending', 'Documents Pending'), ('document_verification', 'Document Verification'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    role_id = models.ForeignKey('CandidateRoles', on_delete=models.SET_NULL, blank=True, null=True)
    pk_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, blank=True, null=True)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, blank=True, null=True)
    title = models.CharField(max_length=20, null=True, blank=True)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(max_length=255, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, null=True, blank=True)
    next_of_kin_fullname = models.CharField(max_length=150, null=True, blank=True)
    next_of_kin_relation = models.CharField(max_length=100, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    next_of_kin_phone = models.CharField(max_length=20, null=True, blank=True)
    current_employer = models.CharField(max_length=255, null=True, blank=True)
    years_of_experience = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    license_number = models.CharField(max_length=100, null=True, blank=True)
    specialisation = models.CharField(max_length=255, null=True, blank=True)
    highest_qualification = models.CharField(max_length=255, null=True, blank=True)
    university_college = models.CharField(max_length=255, null=True, blank=True)
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    certifications = models.TextField(null=True, blank=True)
    street_address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    postcode = models.CharField(max_length=20, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    preferred_shift = models.CharField(max_length=100, null=True, blank=True)
    commenced_date = models.DateField(null=True, blank=True)
    preferred_interview_date = models.DateField(null=True, blank=True)
    application_status = models.CharField(max_length=50, choices=APPLICATION_STATUS_CHOICES, default='application_submitted', null=True, blank=True)
    applied_for = models.ForeignKey('JobOpening', on_delete=models.SET_NULL, null=True, blank=True)
    applied_date = models.DateField(null=True, blank=True)
    recruitment_stage = models.CharField(max_length=30, choices=RECRUITMENT_STAGE_CHOICES, default='applied', null=True, blank=True)
    ai_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    hr_screening_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='pending', null=True, blank=True)
    technical_interview_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='pending', null=True, blank=True)
    final_interview_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='pending', null=True, blank=True)
    interview_date = models.DateField(null=True, blank=True)
    interview_time = models.TimeField(null=True, blank=True)
    interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPE_CHOICES, null=True, blank=True)
    interviewer = models.ForeignKey('EMSColleague', on_delete=models.SET_NULL, null=True, blank=True)
    interview_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='pending', null=True, blank=True)
    background_check_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='pending', null=True, blank=True)
    background_check_date = models.DateField(null=True, blank=True)
    offer_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='pending', null=True, blank=True)
    offered_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    offer_date = models.DateField(null=True, blank=True)
    joining_date = models.DateField(null=True, blank=True)        
    status = models.IntegerField(default=1, null=True, blank=True)
    is_deleted = models.IntegerField(default=0, null=True, blank=True)
    added_by = models.CharField(max_length=50, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    modify_by = models.CharField(max_length=50, null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = 'Candidate'

class DocumentType(models.Model):
    doc_id = models.AutoField(primary_key=True)
    document_type = models.CharField(max_length=100, null=True, blank=True)
    TYPE_CHOICES = [('document', 'Document'),('signature', 'Signature'),]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, null=True, blank=True)
    status = models.IntegerField(default=1, null=True, blank=True)
    is_deleted = models.IntegerField(default=0, null=True, blank=True)
    added_by = models.CharField(max_length=50, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    modify_by = models.CharField(max_length=50, null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = 'ems_hrm_document_type'
    
class CandidateDocument(models.Model):
    VERIFICATION_STATUS_CHOICES = [('done', 'Done'), ('pending', 'Pending'), ('uploaded', 'Uploaded'), ('verified', 'Verified'), ('rejected', 'Rejected')]
    pk_id = models.AutoField(primary_key=True)
    candidate = models.ForeignKey('Candidate', on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    colleague = models.ForeignKey('EMSColleague', on_delete=models.CASCADE, related_name='EMSColleague_documents', null=True, blank=True)
    document_type = models.ForeignKey(DocumentType, on_delete=models.SET_NULL, null=True, blank=True)
    document = models.FileField(upload_to='candidate_documents/', null=True, blank=True)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='pending', null=True, blank=True)
    is_signature_required = models.BooleanField(default=False, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    verified_by = models.CharField(max_length=50, null=True, blank=True)
    verified_date = models.DateTimeField(null=True, blank=True)
    organization = models.ForeignKey(Organization,on_delete=models.SET_NULL,blank=True,null=True,)
    branch = models.ForeignKey(Branch,on_delete=models.SET_NULL,blank=True,null=True,)
    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True, blank=True)
    
    

    class Meta:
        db_table = 'ems_hrm_candidate_documents'

class JobOpening(models.Model):
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full-Time'),
        ('part_time', 'Part-Time'),
        ('on_call', 'On-Call'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    pk_id = models.AutoField(primary_key=True)
    organization = models.ForeignKey(Organization,db_column="organization_id",on_delete=models.SET_NULL,null=True,blank=True)
    job_title = models.CharField(max_length=255)
    department = models.ForeignKey(Department,on_delete=models.SET_NULL,null=True,blank=True,related_name='job_openings')
    employment_type = models.CharField(max_length=30,choices=EMPLOYMENT_TYPE_CHOICES)
    location = models.CharField(max_length=255)
    salary_min = models.DecimalField(max_digits=12,decimal_places=2)
    salary_max = models.DecimalField(max_digits=12,decimal_places=2)
    application_deadline = models.DateField()
    priority = models.CharField(max_length=20,choices=PRIORITY_CHOICES,default='normal')
    job_description = models.TextField()

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    status = models.IntegerField(default=1, null=True, blank=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    modify_by = models.CharField(max_length=50, null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.job_title

class EmployeeUniform(models.Model):
    HAT_CHOICES = (
        ("yes", "Yes"),
        ("no", "No"),
    )
    pk_id = models.AutoField(primary_key=True)
    clg = models.ForeignKey(EMSColleague,db_column="clg_id",on_delete=models.CASCADE,null=True,blank=True)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    shirt_size = models.CharField(max_length=20,null=True,blank=True)
    coat_size = models.CharField(max_length=20,null=True,blank=True)
    jacket_size = models.CharField(max_length=20,null=True,blank=True)
    hat = models.CharField(max_length=10,choices=HAT_CHOICES,null=True,blank=True)
    shirt_qty = models.IntegerField(null=True, blank=True)
    coat_qty = models.IntegerField(null=True, blank=True)
    coats = models.CharField(max_length=20, null=True, blank=True)
    epaulettes = models.CharField(max_length=20, null=True, blank=True)
    balmoral_size = models.CharField(max_length=20, null=True, blank=True)
    balmoral_qty = models.IntegerField(null=True, blank=True)
    contract = models.CharField(max_length=50, null=True, blank=True)
    deposit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    uniform_return = models.BooleanField(default=False, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    status = models.IntegerField(default=1, null=True, blank=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)
    added_by = models.CharField(max_length=50, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    modify_by = models.CharField(max_length=50, null=True, blank=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return f"Uniform - {self.clg_id}"

class AssetCategory(models.Model):
    category_id = models.AutoField(primary_key=True)

    category_name = models.CharField(max_length=100, blank=True, null=True)
    category_code = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_asset_category"


class Asset(models.Model):
    asset_id = models.AutoField(primary_key=True)

    category = models.ForeignKey(AssetCategory,db_column="category_id",on_delete=models.CASCADE,blank=True,null=True,)

    asset_name = models.CharField(max_length=150, blank=True, null=True)
    asset_code = models.CharField(max_length=50, unique=True, blank=True, null=True)

    serial_number = models.CharField(max_length=100, blank=True, null=True)
    model_number = models.CharField(max_length=100, blank=True, null=True)
    manufacturer = models.CharField(max_length=100, blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)

    purchase_date = models.DateField(blank=True, null=True)

    purchase_price = models.DecimalField(max_digits=12,decimal_places=2,blank=True,null=True,)

    warranty_expiry = models.DateField(blank=True, null=True)

    asset_condition = models.CharField(max_length=30,blank=True,null=True,)

    asset_status = models.CharField(max_length=30,blank=True,null=True,)

    remarks = models.TextField(blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_asset_master"


class EmployeeAsset(models.Model):
    employee_asset_id = models.AutoField(primary_key=True)

    employee = models.ForeignKey(
        EMSColleague,
        db_column="clg_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    asset = models.ForeignKey(
        Asset,
        db_column="asset_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    assigned_date = models.DateField(blank=True, null=True)

    expected_return_date = models.DateField(blank=True, null=True)

    actual_return_date = models.DateField(blank=True, null=True)

    issued_by = models.CharField(max_length=100, blank=True, null=True)

    received_by = models.CharField(max_length=100, blank=True, null=True)

    assignment_status = models.CharField(max_length=30,blank=True,null=True,)

    remarks = models.TextField(blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_employee_asset"



class AssetReturn(models.Model):
    return_id = models.AutoField(primary_key=True)

    employee_asset = models.ForeignKey(
        EmployeeAsset,
        db_column="employee_asset_id",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    return_date = models.DateField(blank=True, null=True)

    returned_condition = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    damage_description = models.TextField(blank=True, null=True)

    penalty_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    remarks = models.TextField(blank=True, null=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    status = models.IntegerField(default=1, blank=True, null=True)
    is_deleted = models.IntegerField(default=0, blank=True, null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = "ems_hrm_asset_return"




class EmsMasState(models.Model):
    st_id = models.AutoField(primary_key=True)
    st_code = models.CharField(max_length=10)
    st_name = models.CharField(max_length=100)
    st_status = models.IntegerField()
    stis_deleted = models.CharField(max_length=1, null=True, blank=True, default='0')

    class Meta:
        managed = False
        db_table = "ems_mas_states"


class EmsMasDistrict(models.Model):
    dst_id = models.AutoField(primary_key=True)
    dst_code = models.CharField(max_length=20)
    dst_name = models.CharField(max_length=100)
    div_id = models.IntegerField(null=True, blank=True)
    dst_state = models.CharField(max_length=10)
    dst_lat = models.CharField(max_length=50, null=True, blank=True)
    dst_lang = models.CharField(max_length=50, null=True, blank=True)
    geo_fence_radius = models.IntegerField(null=True, blank=True)
    dst_status = models.IntegerField()
    dstis_deleted = models.CharField(max_length=1)

    class Meta:
        # managed = False
        db_table = "ems_mas_districts"




class EmsIncidence(models.Model):

    inc_id = models.BigAutoField(primary_key=True)

    inc_state_id = models.CharField(max_length=10,db_column="inc_state_id")
    inc_district_id = models.IntegerField(db_column="inc_district_id",null=True,blank=True)
    inc_ref_id = models.CharField(max_length=20)
    bk_inc_ref_id = models.CharField(max_length=20)
    inc_wht_three_wrd = models.CharField(max_length=20,null=True,blank=True)
    inc_caller_id = models.BigIntegerField()
    inc_caller_mobile = models.CharField(max_length=15)
    inc_caller_name = models.CharField(max_length=50,null=True,blank=True)
    inc_caller_relation = models.CharField(max_length=30,null=True,blank=True)
    inc_base_month = models.IntegerField()
    inc_patient_cnt = models.IntegerField()
    inc_complaint = models.IntegerField()
    inc_complaint_other = models.TextField()
    inc_type = models.CharField(max_length=50,null=True,blank=True)
    inc_avaya_uniqueid = models.CharField(max_length=50,null=True,blank=True)
    inc_service = models.CharField(max_length=50)
    inc_datetime = models.DateTimeField()
    inc_recive_time = models.DateTimeField(null=True,blank=True)
    inc_address = models.CharField(max_length=200,null=True,blank=True)
    inc_city_id = models.IntegerField(null=True,blank=True)
    inc_pincode = models.IntegerField(null=True,blank=True)
    inc_lat = models.CharField(max_length=100,null=True,blank=True)
    inc_long = models.CharField(max_length=100,null=True,blank=True)
    destination_hospital_id = models.IntegerField(null=True,blank=True)
    inc_ero_summary = models.TextField()
    inc_back_hospital = models.CharField(max_length=50,null=True,blank=True)
    inc_back_home_address = models.CharField(max_length=100,null=True,blank=True)
    event_status = models.CharField(max_length=1,choices=[("0", "No"),("1", "Yes"),],)
    schedule_from_time = models.DateTimeField(null=True,blank=True)
    schedule_to_time = models.DateTimeField(null=True,blank=True)

    event_name = models.CharField(max_length=100)

    event_organization_name = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    termination_reason = models.CharField(max_length=50)
    termination_reason_other = models.TextField()

    followup_reason = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    followup_reason_other = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    followup_schedule_datetime = models.DateTimeField(
        null=True,
        blank=True
    )

    inc_dispatch_time = models.TimeField()
    inc_suggested_amb = models.CharField(max_length=10)

    inc_duplicate = models.CharField(
        max_length=3,
        choices=[
            ("No", "No"),
            ("Yes", "Yes"),
        ],
        default="No",
    )

    incis_deleted = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
            ("2", "2"),
            ("3", "3"),
            ("4", "4"),
            ("5", "5"),
        ],
    )

    followup_status = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
            ("2", "2"),
        ],
        default="0",
    )

    inc_added_by = models.CharField(max_length=50)
    inc_thirdparty = models.IntegerField()
    inc_system_type = models.CharField(max_length=10)

    inc_set_amb = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
        ],
    )

    inc_pcr_status = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
        ],
        default="0",
    )

    pre_inc_ref_id = models.CharField(max_length=50)

    inc_feedback_status = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
            ("2", "2"),
        ],
        default="0",
    )

    inc_audit_status = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
        ],
        default="0",
    )

    patient_ava_or_not = models.CharField(
        max_length=10,
        null=True,
        blank=True
    )

    patient_ava_or_not_reason = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    CADIncidentID = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    patient_ava_or_not_other_reason = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    patient_ava_or_not_remark = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    inc_at_scene_img = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
        ],
        default="0",
    )

    inc_images = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    inc_ero_file_attached = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    inc_video = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    modify_date_sync = models.DateTimeField(
        auto_now=True
    )

    quality_audit_status = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
        ],
        default="0",
    )

    closure_data_pass_to_gps = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
            ("2", "2"),
            ("3", "3"),
        ],
        default="0",
    )

    offlinedata_img = models.TextField(
        null=True,
        blank=True
    )

    offline_pcr_status = models.IntegerField(
        null=True,
        blank=True
    )

    inc_modify_by = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    inc_modify_date = models.DateTimeField(
        null=True,
        blank=True
    )

    inc_ptn_condition = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    atnd_ercp_call_status = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
            ("2", "2"),
        ],
    )

    start_time_at_maryland = models.DateTimeField(
        null=True,
        blank=True
    )

    steps_handling_status =  models.CharField(
        max_length=2,
        choices=[
            ("0", "0"),
            ("1", "1"),
            ("2", "2"),
            ("3", "3"),
            ("4", "4"),
            ("5", "5"),
            ("6", "6"),
            ("7", "7"),
            ("8", "8"),
            ("9", "9"),
            ("10", "10"),
            ("11", "11"),
            ("12", "12"),
        ],
    )

    inc_estimate_cost = models.DecimalField(max_digits=10,decimal_places=2,null=True,blank = True)
    inc_medical_staff = models.JSONField(null=True,blank=True)
    closed_by =  models.CharField(max_length=50,null=True,blank=True)
    closed_datetime = models.DateTimeField(auto_now_add=True,null=True,blank=True)


    class Meta:
        managed = False
        db_table = "ems_incidence"

    def __str__(self):
        return f"{self.inc_id} - {self.inc_ref_id}"




class EmsIncidenceAmbulance(models.Model):

    inc_amb_id = models.AutoField(primary_key=True)

    inc_ref_id = models.CharField(
        max_length=50,
        db_column="inc_ref_id"
    )

    bk_inc_ref_id = models.CharField(
        max_length=100
    )

    inc_base_month = models.IntegerField()

    amb_rto_register_no = models.CharField(
        max_length=50
    )

    amb_district = models.IntegerField(
        null=True,
        blank=True
    )

    # ward_id = models.CharField(
    #     max_length=20,
    #     null=True,
    #     blank=True
    # )

    # ward_name = models.TextField(
    #     null=True,
    #     blank=True
    # )

    base_location_id = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    base_location_dist_id = models.IntegerField(
        null=True,
        blank=True
    )

    base_location_name = models.TextField(
        null=True,
        blank=True
    )

    assigned_time = models.DateTimeField()

    # amb_pilot_id = models.CharField(
    #     max_length=100,
    #     null=True,
    #     blank=True
    # )

    # amb_emt_id = models.CharField(
    #     max_length=100,
    #     null=True,
    #     blank=True
    # )

    amb_status = models.CharField(
        max_length=9,
        choices=[
            ("assign", "Assign"),
            ("current", "Current"),
            ("completed", "Completed"),
            ("", "Empty"),
        ],
    )

    amb_type = models.CharField(
        max_length=7,
        choices=[
            ("assign", "Assign"),
            ("standby", "Standby"),
        ],
        default="assign",
    )

    modify_date_sync = models.DateTimeField(
        auto_now=True
    )

    crew_id = models.JSONField(
        null=True,
        blank=True
    )
    # it stores clg_id like this [{"id":8,"name":"Yojan"},{"id":9,"name":"Sarika"},{"id":10,"name":"Chandan"}]

    class Meta:
        managed = False
        db_table = "ems_incidence_ambulance"

    def __str__(self):
        return f"{self.inc_ref_id} - {self.amb_rto_register_no}"




class holiday_enum(enum.Enum):
    active = 1
    inctivate = 2
    pending = 3

class Holiday(models.Model):

    holiday_id = models.AutoField(primary_key=True)
    holiday_name = models.CharField(max_length=100)
    # holiday_date = models.JSONField(blank=True,null=True)
    holiday_type = models.CharField(max_length=30,blank=True,null=True)

    year = models.IntegerField(blank=True,null=True)
    description = models.TextField(blank=True,null=True)

    organization = models.ForeignKey(Organization,on_delete=models.SET_NULL,blank=True,null=True)
    branch = models.ForeignKey(Branch,on_delete=models.SET_NULL,blank=True,null=True)

    status = models.IntegerField(holiday_enum,blank=True,null=True)

    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True,null=True,blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True,null=True,blank=True)

    class Meta:
        db_table = "ems_hrm_holiday"


class HolidayDate(models.Model):
 
    holiday_date_id = models.AutoField(primary_key=True)
    holiday = models.ForeignKey(Holiday,on_delete=models.CASCADE,related_name="dates")
    holiday_date = models.DateField()
    added_date = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        constraints = [models.UniqueConstraint(fields=["holiday", "holiday_date"],name="unique_holiday_date")]



class EMSAsset(models.Model):
    CATEGORY_CHOICES = (
        ("laptop", "Laptop"),
        ("mobile", "Mobile"),
        ("desktop", "Desktop"),
        ("printer", "Printer"),
        ("vehicle", "Vehicle"),
        # ("uniform", "Uniform"),
        ("id_card", "ID Card"),
        # ("sim_card", "SIM Card"),
        ("accessory", "Accessory"),
        ("other", "Other"),
    )
    CONDITION_CHOICES = (
        ("new", "New"),
        ("good", "Good"),
        ("fair", "Fair"),
        ("damaged", "Damaged"),
    )
    STATUS_CHOICES = (
        ("available", "Available"),
        ("assigned", "Assigned"),
        ("under_repair", "Under Repair"),
        ("retired", "Retired"),
    )
    IS_DELETED_CHOICES = (
        ("0", "No"),
        ("1", "Yes"),
    )

    asset_id = models.AutoField(primary_key=True)
    asset_tag = models.CharField(max_length=50, unique=True)          # e.g. AST-071000013 (like routing no.)
    asset_name = models.CharField(max_length=100)                     # e.g. "Dell Latitude 5420"
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    brand = models.CharField(max_length=50, blank=True, null=True)
    model_name = models.CharField(max_length=50, blank=True, null=True)
    serial_number = models.CharField(max_length=100, blank=True, null=True, unique=True)

    purchase_date = models.DateField(blank=True, null=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    warranty_expiry = models.DateField(blank=True, null=True)
    vendor_name = models.CharField(max_length=100, blank=True, null=True)

    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default="new")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="available")
    remarks = models.CharField(max_length=255, blank=True, null=True)

    is_deleted = models.CharField(max_length=1, choices=IS_DELETED_CHOICES, default="0")
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = "ems_asset"

    def __str__(self):
        return f"{self.asset_tag} - {self.asset_name}"


class EMSAssetAllocation(models.Model):
    VERIFICATION_CHOICES = (
        ("pending", "Pending"),
        ("verified", "Verified"),
    )
    ALLOCATION_STATUS_CHOICES = (
        ("active", "Active"),
        ("pending", "Pending"),
        ("on_hold", "On Hold"),
        ("returned", "Returned"),
    )
    IS_DELETED_CHOICES = (
        ("0", "No"),
        ("1", "Yes"),
    )

    allocation_id = models.AutoField(primary_key=True)
    colleague = models.ForeignKey(
        EMSColleague,
        db_column="colleague_id",
        on_delete=models.CASCADE,
        related_name="asset_allocations",
    )
    asset = models.ForeignKey(
        EMSAsset,
        db_column="asset_id",
        on_delete=models.CASCADE,
        related_name="allocations",
    )

    allocated_date = models.DateField(default=timezone.now)
    expected_return_date = models.DateField(blank=True, null=True)
    actual_return_date = models.DateField(blank=True, null=True)

    condition_at_allocation = models.CharField(max_length=10, choices=EMSAsset.CONDITION_CHOICES, blank=True, null=True)
    condition_at_return = models.CharField(max_length=10, choices=EMSAsset.CONDITION_CHOICES, blank=True, null=True)

    verification_status = models.CharField(max_length=10, choices=VERIFICATION_CHOICES, default="pending")
    verified_by = models.CharField(max_length=50, blank=True, null=True)
    verified_on = models.DateTimeField(blank=True, null=True)

    allocation_status = models.CharField(max_length=10, choices=ALLOCATION_STATUS_CHOICES, default="pending")

    remarks = models.CharField(max_length=255, blank=True, null=True)

    is_deleted = models.CharField(max_length=1, choices=IS_DELETED_CHOICES, default="0")
    added_by = models.CharField(max_length=50, blank=True, null=True)
    added_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    modify_by = models.CharField(max_length=50, blank=True, null=True)
    modify_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = "ems_asset_allocation"
        # one active allocation per asset at a time (optional, remove if not needed)
        constraints = [
            models.UniqueConstraint(
                fields=["asset"],
                condition=models.Q(allocation_status__in=["active", "pending", "on_hold"]),
                name="uniq_active_allocation_per_asset",
            )
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # keep asset.status in sync with allocation lifecycle
        if self.allocation_status in ("active", "pending", "on_hold") and self.asset.status != "assigned":
            self.asset.status = "assigned"
            self.asset.save(update_fields=["status"])
        elif self.allocation_status == "returned" and self.asset.status != "available":
            self.asset.status = "available"
            self.asset.save(update_fields=["status"])

    def __str__(self):
        return f"{self.colleague} -> {self.asset}"
    





# from django.db import models
# from django.utils import timezone


class EmployeeBankAccount(models.Model):

    VERIFICATION_STATUS_CHOICES = (
        ("pending", "Pending"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    )

    PAY_STATUS_CHOICES = (
        ("pending", "Pending"),
        ("active", "Active"),
        ("on_hold", "On Hold"),
        ("inactive", "Inactive"),
    )

    ACCOUNT_TYPE_CHOICES = (
        ("checking", "Checking"),
        ("savings", "Savings"),
    )

    bank_id = models.AutoField(primary_key=True)

    # Employee
    employee = models.ForeignKey(
        "EMSColleague",
        on_delete=models.PROTECT,
        related_name="bank_accounts",
        db_column="employee_id"
    )

    # Employee email / bank details
    email = models.EmailField(
        max_length=100,
        blank=True,
        null=True
    )

    bank_name = models.CharField(
        max_length=150
    )

    bank_address = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    account_number = models.CharField(
        max_length=50
    )

    account_name = models.CharField(
        max_length=150
    )

    # 6 digit bank sort code / routing number
    routing_number = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPE_CHOICES,
        default="checking"
    )

    # Verification
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default="pending"
    )

    verified_by = models.ForeignKey(
        "EMSColleague",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="verified_bank_accounts",
        db_column="verified_by"
    )

    verified_on = models.DateTimeField(
        blank=True,
        null=True
    )

    # Payroll status
    pay_status = models.CharField(
        max_length=20,
        choices=PAY_STATUS_CHOICES,
        default="pending"
    )

    # Soft delete
    is_deleted = models.BooleanField(
        default=False
    )

    # Audit
    added_by = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    added_date = models.DateTimeField(
        auto_now_add=True
    )

    modified_by = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    modified_date = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "employee_bank_account"
        ordering = ["-bank_id"]

    def __str__(self):
        return f"{self.employee} - {self.bank_name}"

    @property
    def masked_account_number(self):
        if not self.account_number:
            return ""

        if len(self.account_number) <= 4:
            return "*" * len(self.account_number)

        return "****" + self.account_number[-4:]

    
class LeaveComment(models.Model):
    cmd_id = models.AutoField(primary_key=True)
    leave = models.ForeignKey(SingleLeaveEntry,on_delete=models.CASCADE,related_name='comments')
    comment = models.TextField(null = True, blank = True)
    added_by = models.CharField(max_length=50,blank=True,null=True)
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ems_hrm_leave_comment"


class device_enum(enum.Enum):
	Android=1
	ios=2

class application_enum(enum.Enum):
	Application=1
	


class Android_updates(models.Model):
	au=models.AutoField(primary_key=True)
	version=models.CharField(max_length=400,null=True)
	Build_number=models.CharField(max_length=400,null=True)
	url = models.CharField(max_length=1000, null=True, blank=True)
	Application=enum.EnumField(application_enum,null=True)
	device=enum.EnumField(device_enum,null=True)
	status = enum.EnumField(status_enum,null=True)
	added_by=models.CharField(max_length=100, blank=True,null=True)
	added_date=models.DateTimeField(auto_now_add=True,null=True)
	last_modified_by=models.CharField(max_length=100, blank=True,null=True)
	last_modified_date=models.DateTimeField(auto_now=True, null=True,blank=True)
	
	def save(self, *args, **kwargs):
		if not self.au:
			self.added_by=self.last_modified_by
		return super().save(*args, **kwargs)


class notification_enum(enum.Enum):
    leave = 1
    holiday = 2
    Shift = 3

NOTIFICATION_LOGOS = {
    notification_enum.leave.value: f"media/notifications/leave.png",
    notification_enum.holiday.value: f"media/notifications/holiday.png",
    notification_enum.Shift.value: f"media/notifications/shift.png",

    # notification_enum.leave.value: f"http://localhost:8000/hrmapi/media/notifications/leave.png",
    # notification_enum.holiday.value: f"http://localhost:8000/hrmapi/media/notifications/holiday.png",
    # notification_enum.Shift.value: f"http://localhost:8000/hrmapi/media/notifications/shift.png",
}

class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)

    employee = models.ForeignKey(EMSColleague,on_delete=models.CASCADE,related_name="notifications")
    reference_id = models.IntegerField(null=True,blank=True)   # here pass id of the notification_type

    title = models.CharField(max_length=255)  
    message = models.TextField()
    notification_type = enum.EnumField(notification_enum,null=True,blank=True)    # ex: leave,holiday..etc

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "ems_hrm_notification"


class EmsMasCity(models.Model):

    cty_id = models.AutoField(primary_key=True)
    cty_code = models.IntegerField(null=True, blank=True)
    cty_name = models.CharField(max_length=100, null=True, blank=True)
    cty_thshil_code = models.IntegerField(null=True, blank=True)
    cty_subcnty_id = models.IntegerField(null=True, blank=True)
    cty_parish_id = models.IntegerField(null=True, blank=True)
    cty_dist_code = models.CharField(max_length=100, null=True, blank=True)
    div_id = models.IntegerField(null=True, blank=True)
    sub_div_id = models.IntegerField(null=True, blank=True)
    cty_satus = models.CharField(max_length=1, null=True, blank=True, default='1')
    ctyis_deleted = models.CharField(max_length=1, null=True, blank=True, default='0')
    city_lat = models.CharField(max_length=50, null=True, blank=True)
    city_lng = models.CharField(max_length=50, null=True, blank=True)
    cty_vcode = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'ems_mas_city'






class IncidentAction(models.Model):

    STATUS_CHOICES = (
        (1, "Accepted"),
        (2, "Rejected"),
    )

    inc_ref_id = models.CharField(
        max_length=100,
        db_index=True
    )

    user = models.ForeignKey(
        EMSColleague,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="incident_actions",
        db_column="user_id"
    )


    status = models.PositiveSmallIntegerField(
        choices=STATUS_CHOICES
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ems_incident_action"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.inc_ref_id} - {self.user} - {self.get_status_display()}"
    
class EMSAmbulance(models.Model):

    amb_id = models.IntegerField(primary_key=True)

    amb_rto_register_no = models.CharField(max_length=50)

    amb_fleet_no = models.CharField(
        max_length=15,
        null=True,
        blank=True
    )

    amb_default_mobile = models.CharField(max_length=15)

    amb_pilot_mobile = models.CharField(max_length=15)

    amb_base_location = models.IntegerField()

    amb_type = models.IntegerField()

    amb_working_area = models.CharField(
        max_length=15,
        null=True,
        blank=True
    )

    vehical_make = models.CharField(max_length=50)

    vehical_make_type = models.CharField(
        max_length=6,
        choices=[
            ("BS-III", "BS-III"),
            ("BS-IV", "BS-IV"),
            ("BS-VI", "BS-VI"),
        ],
        null=True,
        blank=True
    )

    vehical_model = models.CharField(max_length=50)

    amb_category = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    amb_owner = models.CharField(max_length=50)

    chases_no = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    amb_vendor = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    Fuel_card_no = models.CharField(
        max_length=30,
        null=True,
        blank=True
    )

    Fuel_card_name = models.IntegerField(
        null=True,
        blank=True
    )

    amb_gps_imei_no = models.CharField(
        max_length=30,
        null=True,
        blank=True
    )

    amb_gps_sim_no = models.CharField(
        max_length=30,
        null=True,
        blank=True
    )

    amb_mdt_srn_no = models.CharField(
        max_length=30,
        null=True,
        blank=True
    )

    amb_mdt_imei_no = models.CharField(
        max_length=30,
        null=True,
        blank=True
    )

    amb_mdt_simcnt_no = models.CharField(
        max_length=30,
        null=True,
        blank=True
    )

    amb_state = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    amb_div_code = models.IntegerField()

    amb_district = models.IntegerField(
        null=True,
        blank=True
    )

    amb_tahsil = models.IntegerField(
        null=True,
        blank=True
    )

    thirdparty = models.IntegerField()

    amb_city = models.IntegerField(
        null=True,
        blank=True
    )

    amb_user_type = models.CharField(
        max_length=10,
        choices=[
            ("tdd", "tdd"),
            ("108", "108"),
            ("bike", "bike"),
            ("108-SAM", "108-SAM"),
            ("vehicle", "vehicle"),
        ]
    )

    amb_user = models.CharField(
        max_length=10,
        null=True,
        blank=True
    )

    amb_lat = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    amb_log = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    gps_amb_lat = models.CharField(max_length=20)

    gps_amb_log = models.CharField(max_length=20)

    amb_supervisor = models.CharField(max_length=20)

    pilot_nm = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    amb_serial_number = models.IntegerField()

    amb_google_address = models.CharField(
        max_length=200,
        null=True,
        blank=True
    )

    ward_name = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    amb_status = models.IntegerField()

    amb_maintainance_status = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    amb_status_oxy = models.IntegerField()

    amb_status_fuel = models.IntegerField()

    ambis_deleted = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
        ]
    )

    ambis_backup = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
        ],
        default="0"
    )

    otp = models.CharField(
        max_length=5,
        null=True,
        blank=True
    )

    otp_count = models.IntegerField(
        null=True,
        blank=True
    )

    otp_expire_time = models.DateTimeField(
        null=True,
        blank=True
    )

    otp_verification = models.CharField(
        max_length=1,
        choices=[
            ("1", "1"),
            ("2", "2"),
        ],
        null=True,
        blank=True
    )

    skip_otp = models.CharField(
        max_length=10,
        null=True,
        blank=True
    )

    amb_ignition = models.CharField(
        max_length=1,
        choices=[
            ("0", "0"),
            ("1", "1"),
        ],
        null=True,
        blank=True
    )

    amb_added_by = models.CharField(max_length=50)

    amb_added_date = models.DateTimeField()

    amb_modify_by = models.CharField(max_length=50)

    amb_modify_date = models.DateTimeField()

    amb_speed = models.CharField(max_length=20)

    amb_Ignition_status = models.CharField(max_length=20)

    amb_on_call_status = models.CharField(
        max_length=15,
        null=True,
        blank=True
    )

    modify_date_sync = models.DateTimeField()

    gps_date_time = models.DateTimeField()

    fuel_limit = models.IntegerField(
        null=True,
        blank=True
    )

    fuel_card_series = models.IntegerField(
        null=True,
        blank=True
    )

    track_amb = models.TextField(
        null=True,
        blank=True
    )

    class Meta:
        managed = False
        db_table = "ems_ambulance"

    def __str__(self):
        return str(self.amb_id)