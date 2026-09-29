from django.urls import path
from .views import *



# ---- EMSAsset endpoints ----
asset_list = EMSAssetViewSet.as_view({"get": "list","post": "create",})
asset_detail = EMSAssetViewSet.as_view({"get": "retrieve","put": "update","patch": "partial_update","delete": "destroy",})
asset_validate_tag = EMSAssetViewSet.as_view({"post": "validate_tag",})
allocation_list = EMSAssetAllocationViewSet.as_view({"get": "list","post": "create",})
allocation_detail = EMSAssetAllocationViewSet.as_view({"get": "retrieve","put": "update","patch": "partial_update","delete": "destroy",})
allocation_stats = EMSAssetAllocationViewSet.as_view({"get": "stats",})
allocation_verify = EMSAssetAllocationViewSet.as_view({"post": "verify",})
allocation_hold = EMSAssetAllocationViewSet.as_view({"post": "hold",})
allocation_return = EMSAssetAllocationViewSet.as_view({"post": "return_asset",})


urlpatterns = [
    #----------------------------------Mayank -------------------------------------------------
    # 1. Tax Configuration APIs (Setup)
    path('tax-config/', TaxConfigurationViewSet.as_view({'get': 'list', 'post': 'create'}), name='tax-config-list'),
    path('tax-config/<int:pk>/', TaxConfigurationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='tax-config-detail'),
    
    # 2. Salary Component APIs (Setup)
    path('salary-components/', SalaryComponentViewSet.as_view({'get': 'list', 'post': 'create'}), name='salary-components-list'),
    path('salary-components/<int:pk>/', SalaryComponentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='salary-components-detail'),
    
    # 3. Live Dashboard (Phase 2)
    path('dashboard/', payroll_dashboard, name='dashboard'),
    
    # 4. Individual Employee Live Details (Phase 3)
    path('employee/<int:employee_id>/live-details/', employee_live_details, name='live_details'),
    
    # 5. Generate Payslip APIs (Phase 3 & 4)
    path('generate-single/', generate_single_payslip, name='generate_single'),
    path('generate-bulk/', generate_bulk_payslip, name='generate_bulk'),
    
    # 6. History & Approval APIs (Phase 6)
    path('employee/<int:employee_id>/payslips/', employee_payslip_history, name='employee_payslips'),
    path('payslip/<int:payslip_id>/approve/', approve_payslip, name='approve_payslip'),
    path('payslip/<int:payslip_id>/mark-paid/', mark_payslip_paid, name='mark_paid'),


    path('combined/', CombinedAPIView.as_view(), name='combined-api'),
    path('permissions/<source>/<role>/', GetPermissionAPIView.as_view(), name='get_permissions'),
    path('permissions/', CreatePermissionAPIView.as_view(), name='create_permission'),
    path('permissions/<int:id>/', UpdatePermissionAPIView.as_view(), name='update_permission'),

    #----------------------------------Mayank -------------------------------------------------
    #----------------------------------Other Team -------------------------------------------------

    




    #-------------------------------- Vinayak --------------------------------------------------------
    # EMP Registration
    path("employee_registretion/",EMSColleagueListCreateView.as_view(),name="colleague-list-create",),
    path("employee_registretion/<int:clg_id>/",EMSColleagueRetrieveUpdateDeleteView.as_view(),name="colleague-detail",),
    path("employee_registretion/import/", EMSColleagueImportView.as_view(), name="colleague-import"),
    path("employee_import_template/",EmployeeImportTemplateAPIView.as_view(),name="employee_import_template"),


    # Document
    path("document_list/", employee_document_listview.as_view(), name="document-list"),
    path("employee_document_list/",EmployeeDocumentListAPIView.as_view(),name="employee-document-list"),
    path("employee_document/<int:id>/",EmployeeDocumentAPIView.as_view(),name="employee-document"),
    path("employee_document_update/<int:id>/",EmployeeDocumentUpdateAPIView.as_view(),name="employee-document-update"),
    path("candidate_documents_bulk/<int:id>/",BulkCandidateDocumentAPIView.as_view(),name="candidate-documents-bulk"),
    path("employee_master/<int:id>/", employee_master_listview.as_view(), name="employee-master-list"),

    # Android
    path("incidents/",IncidentListCreateAPIView.as_view(),name="incident-list-create",),
    path("incidents/<int:inc_id>/",IncidentDetailAPIView.as_view(),name="incident-detail",),
    path("fetch_assign_event/",FetchAssignEventAPIView.as_view(),name="fetch-assign-event",),
    path("accept_reject_event/",AcceptRejectIncidentAPIView.as_view(),name="accept-reject-event",),
    path("pre_shift_checklist/",PrecheckListapiView.as_view(),name="pre-shift-checklist",),



    # Assets
    path("assets/", asset_list, name="asset-list"),
    path("assets/<int:pk>/", asset_detail, name="asset-detail"),
    path("assets/validate-tag/", asset_validate_tag, name="asset-validate-tag"),
    path("asset-allocations/", allocation_list, name="asset-allocation-list"),
    path("asset-allocations/<int:pk>/", allocation_detail, name="asset-allocation-detail"),
    path("asset-allocations/stats/", allocation_stats, name="asset-allocation-stats"),
    path("asset-allocations/<int:pk>/verify/", allocation_verify, name="asset-allocation-verify"),
    path("asset-allocations/<int:pk>/hold/", allocation_hold, name="asset-allocation-hold"),
    path("asset-allocations/<int:pk>/return/", allocation_return, name="asset-allocation-return"),
    path("asset/category-count/",EMSAssetCategoryCountAPIView.as_view(),name="asset-category-count"),
    path("asset_categories/",AssetCategoryAPIView.as_view(),name="asset-categories"),


    # Bank Verification
    path("employee_bank_accounts/",EmployeeBankAccountListCreateAPIView.as_view(),name="employee-bank-account-list-create"),
    path("employee_bank_accounts/<int:pk>/",EmployeeBankAccountDetailAPIView.as_view(),name="employee-bank-account-detail"),
    path("employee_bank_accounts/<int:pk>/initiate-verification/",EmployeeBankAccountInitiateVerificationAPIView.as_view(),name="employee-bank-account-initiate-verification"),
    path("employee_bank_accounts/<int:pk>/verify/",EmployeeBankAccountVerifyAPIView.as_view(),name="employee-bank-account-verify"),
    path("employee_bank_accounts/dashboard/",EmployeeBankAccountDashboardAPIView.as_view(),name="employee-bank-account-dashboard"),

    


    #-------------------------------- Vinayak --------------------------------------------------------

    # ----------------------------------Nikita -------------------------------------------------
    path("employees/", EMSColleagueGetAPIView.as_view(), name="employees"),

    path("login/", UserLoginView.as_view(), name="user-login"),
    path("logout/", LogoutView.as_view(), name="user-logout"),
    # ----Crew App----
    path('clg_login/',ColleagueOTPLogin.as_view()),
    path('clg_otp_chk/',OTPCheck.as_view(),name="OTPCHECK"),    
    path('clg_logout/',ColleagueLogoutView.as_view(),name="clg_logout"),
    # ----Crew App----
    path("shift/", ShiftListCreateAPIView.as_view(), name="shift-list-create"),
    path("shift/<int:shift_id>/", ShiftDetailAPIView.as_view(), name="shift-detail"),
    path("shift-roster/",ShiftRosterListCreateAPIView.as_view(),name="shift-roster-list-create",),
    path("shift-roster/update/", ShiftRosterUpdateAPIView.as_view(), name="shift-roster-update"),
    path("shift-roster/delete/<int:roster_id>/", ShiftRosterDeleteAPIView.as_view(), name="shift-roster-delete"),
    path("shift-roster/<int:roster_id>/",ShiftRosterDetailAPIView.as_view(),name="shift-roster-detail",),
    path("leave-type/",LeaveTypeListCreateAPIView.as_view(),name="leave-type-list-create",),
    path("leave-type/<int:leave_type_id>/",LeaveTypeDetailAPIView.as_view(),name="leave-type-detail",),
    path("asset-category/", AssetCategoryAPIView.as_view(), name="asset-category-list-create",),
    path("asset-category/<int:pk>/", AssetCategoryAPIView.as_view(), name="asset-category-detail",),
    path("asset/", AssetAPIView.as_view(), name="asset-list-create"),
    path("asset/<int:pk>/", AssetAPIView.as_view(), name="asset-detail"),
    path("availability/", Availability.as_view(), name="availability"),
    path("emp-location/", EmployeeLocationAPIView.as_view(), name="employee-location-create"),
    path("emp-location-points/", EmployeeLocationPointsAPIView.as_view(), name="employee-location-points"),
    # ----------------------------------Nikita -------------------------------------------------

#-------------------------------- kirti --------------------------------------------------------
    path("profile-picture/", ProfilePictureAPIView.as_view(), name="profile-picture"),
    path('clg_profile_view/',GetProfile.as_view(),name = 'clg_profile_view'),
    path('OrganizationBranchDept/',OrganizationBranchDept.as_view(),name = 'OrganizationBranchDept'),
    path('generate_captcha', GenerateCaptchaView.as_view(), name='generate_captcha'),
    path('verify_captcha', VerifyCaptchaView.as_view(), name='verify_captcha'),
    path('CandidateRegistration/',CandidateRegistration.as_view(),name='candidate-registration'),
    path('CandidateGetList/',GetCandidateList.as_view(),name='candidate-get-list'),
    path('department_post/', DepartmentPostAPI.as_view(), name='department-add'),
    path('department_get/', DepartmentGetAPI.as_view(), name='department-get'),
    path('department_put/<int:pk_id>/', DepartmentPut.as_view(), name='department-update'),
    path('department_delete/<int:pk_id>/', DepartmentDelete.as_view(), name='department-delete'),
    path('OrganizationPost/', OrganizationPost.as_view(), name='organization-add'),
    path('OrganizationGet/', OrganizationGet.as_view(), name='organization-get'),
    path('OrganizationPut/<int:pk_id>/', OrganizationPut.as_view(), name='organization-update'),
    path('BranchPost/', BranchPost.as_view(), name='branch-add'),
    path('BranchGet/', BranchGet.as_view(), name='branch-get'),
    path('BranchPut/<int:pk_id>/', BranchPut.as_view(), name='branch-update'),
    path('BranchDelete/<int:pk_id>/', BranchDelete.as_view(), name='branch-delete'),
    path('DepartmentwiseGroupGet/<int:department_id>/', DepartmentWiseGroupGet.as_view(), name='ems-group-add'),
    path('employee_uniform/',EmployeeUniformPost.as_view(),name='employee-uniform-post'),
    path('employee_uniform/<int:clg_id>/',EmployeeUniformGet.as_view(),name='employee-uniform-get'),
    path('employee_uniform/update/<int:pk_id>/',EmployeeUniformPut.as_view(),name='employee-uniform-update'),
    path('attendance_post/', Attendancepost.as_view(), name='attendance-post'),
    path('attendance_get/', AttendanceGetall.as_view(), name='attendance-get'),
    path("attendance/update/<int:attendance_id>/", AttendanceUpdate.as_view(), name="attendance-update"),
    path('attendance_month/', EmployeeMonthlyAttendanceStatus.as_view(), name='attendance-month'),
    path('attendance_ID/', AttendanceGetByIdWise.as_view(), name='attendance-ID'),
    path('clockin_status/', ClockinStatus.as_view(), name='clock-in-status'),
    path('punch_detail/', AttendancePunchDetail.as_view(), name='Punch-detail'),
    path('Today_dash_count/', TodayAttendanceDashboard.as_view(), name='today-dash-count'),
    path('JobOpeningPost/', JobOpeningPost.as_view(), name='job-opening-post'),
    path('JobOpeningGet/', JobOpeningGet.as_view(), name='job-opening-get'),
    path('GroupPost/', GroupPost.as_view(), name='group-post'),
    path('GroupGet/', GroupGet.as_view(), name='group-get'),
    path('GroupDelete/<int:gid>/', GroupDelete.as_view(), name='group-delete'),
    path('GroupPut/<int:gid>/', GroupPut.as_view(), name='group-update'),
    path('GetCandidateRoles/', CandidateRolesGetAPI.as_view(), name='candidate-roles'),
    path('organizationwise_employee_get/<int:organization_id>/', OrganizationWiseEmployeeGet.as_view(), name='organizationwise-employee-get'),
    path('attendance/manual_create/', AttendanceCreateAPIView.as_view(), name='create-attendance'),
    # path('clg_email_login/', ColleagueEmailOTPLogin.as_view()),
    # path('clg_email_otp_chk/', EmailOTPCHECK.as_view(), name="EmailOTPCHECK"), 
    path('break_types/',EMSBreakTypeGet.as_view(),name="break-types"),
    path('Break_Details/',BreakDetails.as_view(),name="BreakDetails"),             
    path('datewise_shift/',EmployeeDateWiseShiftGet.as_view(), name='datewise_shift'),
    path('update_check/<int:device_type>/<str:version_number>/<str:build_number>/<int:App>/',update_check.as_view(),name="update_check"),
    path('DepartmentwiseColleagueGet/<int:pk_id>/',DepartmentwiseColleagueGet.as_view(),name='DepartmentwiseColleagueGet'),
    path('getstate/',StateGet.as_view(),name='getstate'),
    path('getdistrict/',DistrictGet.as_view(),name='getdistrict'),
    path('getcity/',CityGet.as_view(),name='getcity'),
    path('ScheduleInterview/',ScheduleInterview.as_view(),name='ScheduleInterview'),
    path('approval_timeline/<int:candidate_id>/',CandidateApprovalTimelineAPI.as_view(),name='candidate-approval-timeline'),
    path('Gettimeslots/',Gettimeslots.as_view(),name='get-timeslots'),
    path('AttendanceReportGet/',AttendanceReportAPIView.as_view(),name='AttendanceReportGet'),
    path("dashboard_api/",Dashboard.as_view(),name="dashboard"),
    #-------------------------------- Ramesh --------------------------------------------------------
    path("ApplyLeave/",ApplyLeaveAPIView.as_view(),name="apply-leave"),
    path("leave_details/",ApplyLeaveAPIView.as_view(),name="leave-type-detail"),
    path("leave_type_create/",LeaveTypeAPI.as_view(),name="leave-type-add"),
    path("leave_approve/",LeaveApproveAPI.as_view(),name="leave-approve"),
    path("leave_reject/",LeaveRejectAPI.as_view(),name="leave-reject"),
    path("assign_leave_to_all/",AssignLeaveToAllAPIView.as_view(),name="assign-leave-toall"),
    path("AssignLeaveToEmployee/",AssignLeaveToEmployeeAPIView.as_view(),name="AssignLeaveToEmployee"),
    path('deleteLeave/',ApplyLeaveAPIView.as_view(),name = "delete-leave"),

    path('employee_details/',EmployeeDirectoryAPI.as_view(),name = 'employee-details'),
    path('EmployeeDirectoryCount/',EmployeeDirectoryCount.as_view(),name = 'FetchDepartment'),
    path('FetchDepartment/',FetchDepartment.as_view(),name = 'FetchDepartment'),

    path('LeaveDashBoard/',LeaveDashBoard.as_view(),name = 'Leave-DashBoard'),
    path('UpcomingLeaves/',UpcomingLeaves.as_view(),name = 'Upcoming-Leaves'),
    path('clg_wise_leave_details/',CheckMyLeave.as_view(),name = 'CheckMyLeave'),
    path('apply_leave_web/',ApplyLeaveWeb.as_view(),name = 'apply_leave_web'),
    path('LeaveRequestWeb/',LeaveRequestWeb.as_view(),name = 'Leave_Request_Web'),
    path('add_comment/',AddComment.as_view(),name = 'AddComment'),
    path('get_all_leavetypes/<int:id>',AllLeaveTypes.as_view(),name = 'AllLeaveTypes'),

    path('add_holiday/',HolidayAPIView.as_view(),name = 'add_holiday'),
    path('update_holiday/<int:holiday_id>/',HolidayAPIView.as_view(),name = 'update_holiday'),
    path('get_holidays/',HolidayAPIView.as_view(),name = 'get_holiday'),
    path('get_holidays/<int:holiday_id>/',HolidayAPIView.as_view(),name = 'get_holiday'),
    path('delete_holiday/<int:holiday_id>/',HolidayAPIView.as_view(),name = 'delete_holiday'),

    path('get_employee_shift/<int:month>/<int:year>',GetEmployeeShiftAPI.as_view(),name = 'GetEmployeeShiftAPI'),

    path('get_notifications/',NotificationListAPIView.as_view(),name = 'get_notifications'),
    path('set_all_msgs_seen/',SetToAllSeenNotification.as_view(),name = 'set_to_all_msgs_seen'),

    path('area_allocation_map/',AreaAllocationAPI.as_view(),name = 'AreaAllocationAPI'),
    path('employee_status_areawise/',EmployeeStatusOnAreaWise.as_view(),name = 'employee_status_area_wise'),

    path('CheckEventOnDate/',CheckEventOnDate.as_view(),name = 'CheckEventOnDate'),
    path('soft_delete_user/',InActivecolleague.as_view(),name = 'soft_delete_user'),
    path('total_branches/',TotalBranches.as_view(),name = 'total_branches'),
    path('total_employees/',TotalEmployees.as_view(),name = 'total_employees'),
    path('total_trips/',TotalTrips.as_view(),name = 'total_incidence'),
    path('TotalAmbulances/',TotalAmbulances.as_view(),name = 'total_ambulances'),
    path('total_department/',TotalDepartments.as_view(),name = 'total_department'),


    path('officers_list/',AddManager.as_view(),name = 'AddManager'),
    # path('uu/',uu.as_view(),name = 'AddManager'),


]

