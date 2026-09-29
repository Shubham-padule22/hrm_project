import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "../Layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../Login/Login";
import CustomLoader from "../common/CustomLoader";
import EmployeeDirectory from "../EmpManagement/EmployeeDirectory";
import EmployeeProfile from "../EmpManagement/EmployeeProfile";
import BankVerification from "../EmpManagement/BankVerification";
import AssetAllocation from "../EmpManagement/AssetAllocation";
import LeaveManagement from "../Attendance/LeaveManagement";
import IDCardGenerator from "../EmpManagement/IDCardGenerator";
import ShiftManagement from "../Attendance/ShiftManagement";
import AreaAllocation from "../Attendance/AreaAllocation";

const Dashboard = lazy(() => import("../UserManagement/Dashboard"));

const CompanyInformation = lazy(
  () => import("../UserManagement/CompanyInformation")
);

const OrgStructureChart = lazy(
  () => import("../UserManagement/OrgStructureChart")
);

const Departments = lazy(
  () => import("../UserManagement/Departments")
);

const EmployeeRegistration = lazy(
  () => import("../EmpRegistration/EmployeeRegistration")
);

const RecrutDetails = lazy(
  () => import("../Recruitment/RecrutDetails")
);

const OnboardingDetails = lazy(
  () => import("../Onboarding/OnboardingDetails")
);

const Attendance = lazy(
  () => import("../Attendance/AttendanceManagment")
);

const AttendanceReport = lazy(
  () => import("../Reports/AttendanceReport")
);

const Permissions = lazy(
  () => import("../Setting/Permissions")
);

const SystemUsers = lazy(
  () => import("../Setting/SystemUsers")
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <Dashboard />
              </Suspense>
            }
          />

          <Route
            path="/company-info"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <CompanyInformation />
              </Suspense>
            }
          />

          <Route
            path="/organization-chart"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <OrgStructureChart />
              </Suspense>
            }
          />

          <Route
            path="/Departments"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <Departments />
              </Suspense>
            }
          />

          <Route
            path="/Onboarding"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <OnboardingDetails />
              </Suspense>
            }
          />

          <Route
            path="/Employee-Registration"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <EmployeeRegistration />
              </Suspense>
            }
          />

          {/* attendance */}
          <Route
            path="/Attendance-management"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <Attendance />
              </Suspense>
            }
          />

          <Route
            path="/Leave-Management"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <LeaveManagement />
              </Suspense>
            }
          />

          <Route
            path="/Shift-Management"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <ShiftManagement />
              </Suspense>
            }
          />
          <Route
            path="/Area-Allocation"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <AreaAllocation />
              </Suspense>
            }
          />

          <Route
            path="/Recruitment"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <RecrutDetails />
              </Suspense>
            }
          />

          

          <Route
            path="/Permission"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <Permissions />
              </Suspense>
            }
          />

          <Route
            path="/System-User"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <SystemUsers />
              </Suspense>
            }
          />

          <Route
            path="/Employee-Directory"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <EmployeeDirectory />
              </Suspense>
            }
          />
          <Route
            path="/employee-directory/:employeeId"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <EmployeeProfile />
              </Suspense>
            }
          />
          <Route
            path="/Bank-Verification"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <BankVerification />
              </Suspense>
            }
          />
          <Route
            path="/Asset-Allocation"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <AssetAllocation />
              </Suspense>
            }
          />
          <Route
            path="/ID-Card-Generator"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <IDCardGenerator />
              </Suspense>
            }
          />
           <Route
            path="/attendance-report"
            element={
              <Suspense
                fallback={
                  <CustomLoader message="Loading page..." height="60vh" />
                }
              >
                <AttendanceReport />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}