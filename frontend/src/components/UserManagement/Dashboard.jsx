import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Avatar,
  Divider,
  LinearProgress,
} from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
// import Inventory2Icon from '@mui/icons-[#Inventory2]';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import {
  CalendarMonth,
  AccessTime,
  Groups,
  Inventory2,
  WarningAmber,
  Login,
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import ambulanceTeam from "../../assets/ambulanceTeam.png";
import team from "../../assets/team.png";


const DASHBOARD_API =
  "http://192.168.1.37/hrmapi/hrm_web/dashboard_api/";

const EMPTY_DASHBOARD = {
  staff_attendance: {
    total_employees: 0,
    present: 0,
    absent: 0,
    half_day: 0,
    leave: 0,
    holiday: 0,
    weekoff: 0,
  },

  crew_attendance: {
    total_crew: 0,
    present: 0,
    absent: 0,
    checked_in: 0,
    missing_logs: 0,
  },

  crew_working_hours: {
    total_hours: 0,
    departments: [],
    employees: [],
  },

  employees_login_summary: [],

  employment_type: [],

  assets_allocated: {
    total: 0,
    by_category: [],
  },

  uniform: {
    issued: 0,
    returned: 0,
  },
};

const COLORS = {
  green: "#075C4D",
  darkGreen: "#06483D",
  red: "#D71920",
  lightRed: "#FFF0F0",
  text: "#243331",
  grey: "#777777",
  border: "#EDF0EF",
};

const attendanceData = [
  { name: "Present", value: 700 },
  { name: "Absent", value: 300 },
];

const employmentData = [
  { name: "16 hour / month", value: 100 },
  { name: "24 hour medical/care team", value: 100 },
  { name: "6/6 Hours / Month", value: 100 },
  { name: "Contractor", value: 100 },
  { name: "Full Time/Care Team", value: 100 },
  { name: "SHA 8 Hours", value: 100 },
  { name: "Zero Hours/Bank", value: 100 },
];

const employmentColors = [
  "#006B5B",
  "#D71920",
  "#F24E35",
  "#FF7161",
  "#F4A261",
  "#E9C46A",
  "#8AC926",
];

const workingHoursData = [
  { name: "Operations", value: 400 },
  { name: "Paramedic", value: 400 },
  { name: "Doctor", value: 400 },
  { name: "Nurse", value: 400 },
  { name: "Admin", value: 400 },
  { name: "Driver", value: 400 },
];

const workingColors = [
  "#E5B13E",
  "#F33F0A",
  "#F88C7D",
  "#CDD98D",
  "#015256",
  "#850020",
];

const loginData = [
  { time: "07:00", employees: 52 },
  { time: "07:30", employees: 55 },
  { time: "08:00", employees: 53 },
  { time: "08:30", employees: 58 },
  { time: "09:00", employees: 56 },
  { time: "09:30", employees: 65 },
  { time: "10:00", employees: 61 },
  { time: "10:30", employees: 68 },
  { time: "11:00", employees: 70 },
  { time: "11:30", employees: 67 },
  { time: "12:00", employees: 75 },
  { time: "12:30", employees: 72 },
  { time: "13:00", employees: 78 },
  { time: "13:30", employees: 74 },
  { time: "14:00", employees: 82 },
  { time: "14:30", employees: 79 },
  { time: "15:00", employees: 86 },
  { time: "15:30", employees: 84 },
  { time: "16:00", employees: 91 },
  { time: "16:30", employees: 88 },
  { time: "17:00", employees: 94 },
  { time: "17:30", employees: 91 },
  { time: "18:00", employees: 98 },
];

const assetsData = [
  { name: "Mobile", value: 20 },
  { name: "Laptop", value: 30 },
  { name: "Desktop", value: 40 },
  { name: "Uniform", value: 25 },
  { name: "Tablet", value: 12 },
];

const employees = [
  {
    name: "Siyahansan",
    role: "EMT",
    hours: "8 Hrs",
    status: "On Time",
    color: "#17A673",
    avatar: "S",
  },
  {
    name: "Devon Lane",
    role: "Paramedic",
    hours: "10 Hrs",
    status: "On Time",
    color: "#F5A623",
    avatar: "D",
  },
  {
    name: "Marvin McKinney",
    role: "Nurse",
    hours: "6 Hrs",
    status: "Break Required",
    color: "#E51D2A",
    avatar: "M",
  },
  {
    name: "Devon Lane",
    role: "Driver",
    hours: "8 Hrs",
    status: "On Time",
    color: "#17A673",
    avatar: "D",
  },
  {
    name: "Eleanor Pena",
    role: "Doctor",
    hours: "7 Hrs",
    status: "Below Required",
    color: "#E51D2A",
    avatar: "E",
  },
];

const cardSx = {
  borderRadius: "12px",
  border: "1px solid #EDF0EF",
  boxShadow: "0 2px 10px rgba(20,40,35,0.04)",
  overflow: "hidden",
};

const titleSx = {
  fontSize: "13px",
  fontWeight: 700,
  color: COLORS.text,
};

function CardTitle({ icon, title, dark = false }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 25,
          height: 25,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          backgroundColor: dark
            ? "rgba(255,255,255,0.12)"
            : "#E8F3EF",
          color: dark ? "#fff" : "#0A6A59",
          "& svg": {
            fontSize: 15,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          ...titleSx,
          color: dark ? "#fff" : COLORS.text,
        }}
      >
        {title}
      </Typography>
    </Stack>
  );
}

/* ------------------------------------------------ */
/* STAFF ATTENDANCE */
/* ------------------------------------------------ */

function AttendanceCard({ data }) {
  const attendanceData = [
    {
      name: "Present",
      value: data.present,
    },
    {
      name: "Absent",
      value: data.absent,
    },
  ];

  return (
    <Card
      sx={{
        ...cardSx,
        height: 198,
        p: 1.5,
      }}
    >
      <CardTitle
        icon={<CalendarMonth />}
        title="Staff Attendance"
      />

      <Box
        sx={{
          height: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Box
          sx={{
            width: 145,
            height: 145,
            position: "relative",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attendanceData}
                dataKey="value"
                innerRadius={42}
                outerRadius={60}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                <Cell fill={COLORS.green} />
                <Cell fill={COLORS.red} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {data.total_employees}
            </Typography>

            <Typography
              sx={{
                fontSize: 7,
                color: "#777",
                mt: 0.5,
              }}
            >
              Total Staff
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1.8}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "3px",
                backgroundColor: COLORS.green,
              }}
            />

            <Typography sx={{ fontSize: 11 }}>
              Present
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {data.present}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "3px",
                backgroundColor: COLORS.red,
              }}
            />

            <Typography sx={{ fontSize: 11 }}>
              Absent
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {data.absent}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}

/* ------------------------------------------------ */
/* HERO */
/* ------------------------------------------------ */

function HeroCard({ period, onPeriodChange }) {
  return (
    <Card
      sx={{
        position: "relative",
        height: 250,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "none",
        background:
          "linear-gradient(90deg,#970E0E 0%,#9D0C0C 45%,#850909 100%)",
      }}
    >
      {/* Image */}
      <Box
        sx={{
          position: "absolute",
          right: -60,
          top:50,
          // left:30,
          bottom: 0,
          width: "55%",
          height: "100%",
        }}
      >
        <Box
          component="img"
          src={ambulanceTeam}
          alt="Ambulance team"
          sx={{
            width: "80%",
            height: "80%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </Box>

      {/* Text */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 3,
          left: 25,
          top: 55,
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            mb: 3,
          }}
        >
          PEOPLE · CARE · GROWTH
        </Typography>

        <Typography
          sx={{
            color: "#fff",
            fontSize: 28,
            lineHeight: 1.15,
            fontWeight: 800,
          }}
        >
          Our People Make a
          <br />
          Healthier Tomorrow
        </Typography>

        <Typography
          sx={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 11,
            mt: 1,
          }}
        >
          Empowering teams. Strengthening care.
        </Typography>
      </Box>

      {/* Top tabs */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 10,
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          height: 44,
          minWidth: 280,
          backgroundColor: "#fff",
          borderRadius: "0 0 10px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          p: 0.5,
        }}
      >
        {[
          {
            label: "Today",
            value: "today",
          },
          {
            label: "This Month",
            value: "month",
          },
          {
            label: "Till Date",
            value: "till_date",
          },
        ].map((tab) => (
          <Box
            key={tab.value}
            onClick={() => onPeriodChange(tab.value)}
            sx={{
              fontSize: ".8rem",
              color:
                period === tab.value
                  ? "#fff"
                  : "#333",
              backgroundColor:
                period === tab.value
                  ? "#EF2430"
                  : "transparent",
              borderRadius: "18px",
              px: 2.8,
              py: 0.5,
              cursor: "pointer",
              transition: "all .2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Box>
    </Card>
  );
}

/* ------------------------------------------------ */
/* UNIFORM */
/* ------------------------------------------------ */

function UniformCard({ data }) {
  return (
    <Card
      sx={{
        height: 72,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "none",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <Box
        sx={{
          backgroundColor: COLORS.green,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: 14 }}>
          Uniform Issued
        </Typography>

        <Typography
          sx={{
            fontSize: 25,
            fontWeight: 600,
          }}
        >
          {data.issued}
        </Typography>
      </Box>

      <Box
        sx={{
          backgroundColor: "#A30E0E",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: 14 }}>
          Uniform Returned
        </Typography>

        <Typography
          sx={{
            fontSize: 25,
            fontWeight: 600,
          }}
        >
          {data.returned}
        </Typography>
      </Box>
    </Card>
  );
}

/* ------------------------------------------------ */
/* EMPLOYMENT TYPE */
/* ------------------------------------------------ */

function EmploymentType({ data }) {
  const employmentData = data.map((item) => ({
    name: item.type,
    value: item.count,
  }));

  return (
    <Card
      sx={{
        ...cardSx,
        height: 315,
        p: 1.5,
      }}
    >
      <CardTitle
        icon={<Groups />}
        title="Employment Type"
      />

      <Box
        sx={{
          height: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: 130,
            height: 120,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={employmentData}
                dataKey="value"
                innerRadius={30}
                outerRadius={58}
                stroke="#fff"
                strokeWidth={2}
              >
                {employmentData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={
                      employmentColors[
                      index % employmentColors.length
                      ]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Stack
          spacing={0.45}
          sx={{
            width: "100%",
            maxHeight: 160,
            overflowY: "auto",
            pr: 0.5,
          }}
        >
          {employmentData.map((item, index) => {
            const color =
              employmentColors[
              index % employmentColors.length
              ];

            return (
              <Stack
                key={`${item.name}-${index}`}
                direction="row"
                alignItems="center"
                spacing={0.7}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: color,
                    flexShrink: 0,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#4B5553",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={item.name}
                >
                  {item.name}
                </Typography>

                <Box sx={{ flex: 1 }} />

                <Box
                  sx={{
                    backgroundColor: `${color}20`,
                    color,
                    borderRadius: "8px",
                    px: 0.7,
                    py: 0.2,
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  {item.value}
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}

/* ------------------------------------------------ */
/* ASSETS */
/* ------------------------------------------------ */
function AssetsCard({ data }) {
  const assetsData = data?.by_category?.map((item) => ({
    name:
      item.category.charAt(0).toUpperCase() +
      item.category.slice(1),
    value: item.count,
  })) || [
    { name: 'Mobile', value: 21 },
    { name: 'Laptop', value: 30 },
    { name: 'Desktop', value: 39 },
    { name: 'Landline', value: 23 },
    { name: 'Tablet', value: 9 },
  ];

  return (
    <Card
      sx={{
        position: 'relative',
        height: 315,
        p: 1.5,
        borderRadius: '12px',
        background: 'linear-gradient(90deg, #0F4D38 0%, #0A3328 100%)',
        color: '#fff',
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Background Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          left: -20,
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -60,
          right: -30,
          width: 240,
          height: 240,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          {/* Header Title with Icon */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LaptopMacIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography sx={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
              Assets Allocated
            </Typography>
          </Stack>

          {/* Stats Total */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              sx={{
                color: '#fff',
                fontSize: 38,
                lineHeight: 1,
                fontWeight: 500,
              }}
            >
              {data?.total ?? 40}
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 7,
                mt: 0.5,
              }}
            >
              Total Assets Allocated
            </Typography>
          </Box>
        </Stack>

        {/* Bar Chart Container */}
        <Box sx={{ width: '100%', height: 225, mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={assetsData}
              margin={{
                top: 15,
                right: 0,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="barGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#A4F59F" />
                  <stop offset="100%" stopColor="#FFDDE000" />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="name"
                tick={{
                  fill: '#B4D2CB',
                  fontSize: 8,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fill: '#B4D2CB',
                  fontSize: 8,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Bar
                dataKey="value"
                fill="url(#barGradient)"
                radius={[8, 8, 8, 8]}
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Card>
  );
}


/* ------------------------------------------------ */
/* LOGIN SUMMARY */
/* ------------------------------------------------ */

function LoginSummary({ data }) {
  return (
    <Card
      sx={{
        ...cardSx,
        height: 280,
        p: 1.5,
        mb: 4,
        position: "relative",
      }}
    >
      <CardTitle
        icon={<Login />}
        title="Employees Login Summary"
      />

      <Box
        sx={{
          height: 240,
          position: "relative",
          mt: 1,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 5,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              stroke="#EEF1F0"
              vertical
              horizontal
            />

            <XAxis
              dataKey="time"
              tick={{
                fontSize: 8,
                fill: "#777",
              }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{
                fontSize: 8,
                fill: "#777",
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="employees"
              stroke={COLORS.green}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Typography
        sx={{
          textAlign: "center",
          fontSize: 8,
          color: "#555",
          pb:2
        }}
      >
        Login Time
      </Typography>
    </Card>
  );
}

/* ------------------------------------------------ */
/* CREW ATTENDANCE */
/* ------------------------------------------------ */

// function CrewAttendance({ data }) {
//   const total = data.checked_in + data.missing_logs;

//   const checkedInPercentage =
//     total > 0
//       ? Math.round((data.checked_in / total) * 100)
//       : 0;

//   const missingPercentage =
//     total > 0
//       ? Math.round((data.missing_logs / total) * 100)
//       : 0;

//   return (
//     <Card
//       sx={{
//         ...cardSx,
//         height: 'auto',
//         p: 1.5,
//         backgroundColor: "#FFF4F4",
//       }}
//     >
//       <CardTitle
//         icon={<WarningAmber />}
//         title="Crew App Attendance"
//       />

//       <Stack
//         direction="row"
//         justifyContent="space-around"
//         mt={1}
//       >
//         <Box>
//           <Typography
//             sx={{
//               fontSize: 25,
//               lineHeight: 1,
//               color: "#EF233C",
//               fontWeight: 800,
//             }}
//           >
//             {data.missing_logs}
//           </Typography>

//           <Typography
//             sx={{
//               fontSize: 7,
//               color: "#777",
//               mt: 0.5,
//             }}
//           >
//             MISSING LOGS
//           </Typography>
//         </Box>

//         <Divider orientation="vertical" flexItem />

//         <Box>
//           <Typography
//             sx={{
//               fontSize: 25,
//               lineHeight: 1,
//               color: "#203532",
//               fontWeight: 800,
//             }}
//           >
//             {data.checked_in}
//           </Typography>

//           <Typography
//             sx={{
//               fontSize: 7,
//               color: "#777",
//               mt: 0.5,
//             }}
//           >
//             CHECKED IN
//           </Typography>
//         </Box>
//       </Stack>

//       <Box sx={{ mt: 1.5 }}>
//         <LinearProgress
//           variant="determinate"
//           value={checkedInPercentage}
//           sx={{
//             height: 9,
//             borderRadius: 10,
//             backgroundColor: "#FFD2D2",
//             "& .MuiLinearProgress-bar": {
//               backgroundColor: "#E5232E",
//             },
//           }}
//         />

//         <Stack
//           direction="row"
//           justifyContent="space-between"
//           mt={0.5}
//         >
//           <Typography sx={{ fontSize: 9 }}>
//             {missingPercentage}%
//           </Typography>

//           <Typography sx={{ fontSize: 9 }}>
//             {checkedInPercentage}%
//           </Typography>
//         </Stack>
//       </Box>

//       {/* <Typography
//         sx={{
//           mt: 0.5,
//           fontSize: 8,
//           color: "#7D7D7D",
//         }}
//       >
//         ◷ Last updated · Today
//       </Typography> */}
//     </Card>
//   );
// }

function CrewAttendance({ data = { missing_logs: 0, checked_in: 660 } }) {
  const total = data.checked_in + data.missing_logs;

  const missingPercentage = total > 0 ? Math.round((data.missing_logs / total) * 100) : 0;
  const checkedInPercentage = total > 0 ? Math.round((data.checked_in / total) * 100) : 0;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        p: 2.5,
        backgroundColor: '#FFF7F7',
        boxShadow: 'none',
        maxWidth: 360,
      }}
    >
      {/* Decorative Soft Circle background on bottom right */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: '#FFEAEA',
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
          <Box
            sx={{
              backgroundColor: '#FFEAEA',
              borderRadius: 2,
              p: 0.75,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningAmberIcon sx={{ color: '#D90429', fontSize: 20 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1D2A3A',
              fontSize: '1.1rem',
            }}
          >
            Crew App Attendance
          </Typography>
        </Stack>

        {/* Numbers Section */}
        <Stack direction="row" alignItems="center" spacing={3} mb={2.5}>
          {/* Missing Logs */}
          <Box>
            <Typography
              sx={{
                fontSize: 32,
                lineHeight: 1,
                color: '#D90429',
                fontWeight: 800,
              }}
            >
              {data.missing_logs}
            </Typography>
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 700,
                color: '#6C757D',
                mt: 0.75,
                letterSpacing: 0.5,
              }}
            >
              MISSING LOGS
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ my: 0.5, borderColor: '#D0D5DD' }} />

          {/* Checked In */}
          <Box>
            <Typography
              sx={{
                fontSize: 32,
                lineHeight: 1,
                color: '#0B3C26',
                fontWeight: 800,
              }}
            >
              {data.checked_in}
            </Typography>
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 700,
                color: '#6C757D',
                mt: 0.75,
                letterSpacing: 0.5,
              }}
            >
              CHECKED IN
            </Typography>
          </Box>
        </Stack>

        {/* Combined Custom Progress Bar with Embedded Labels */}
        <Box
          sx={{
            height: 22,
            borderRadius: 12,
            backgroundColor: '#FFD6D6',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Missing portion (Red) */}
          <Box
            sx={{
              width: `${missingPercentage}%`,
              height: '100%',
              backgroundColor: '#D90429',
              borderRadius: '12px 0 0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 28,
            }}
          >
            <Typography sx={{ color: '#FFF', fontSize: 10, fontWeight: 700 }}>
              {missingPercentage}%
            </Typography>
          </Box>

          {/* Checked in percentage label positioned on the right */}
          <Typography
            sx={{
              position: 'absolute',
              right: 12,
              color: '#1D2A3A',
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {checkedInPercentage}%
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

/* ------------------------------------------------ */
/* CREW WORKING HOURS */
/* ------------------------------------------------ */

function WorkingHours({ data }) {
  const workingHoursData = data.departments.map((item) => ({
    name: item.department || "Other",
    value: Number(item.working_hours || 0),
  }));

  return (
    <Card
      sx={{
        ...cardSx,
        p: 1.5,
        flex: .94,
      }}
    >
      <CardTitle
        icon={<AccessTime />}
        title="Crew Working Hours"
      />

      <Box
        sx={{
          width: "100%",
          height: 205,
          mt: 0.5,
        }}
      >
        {workingHoursData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={workingHoursData}
                dataKey="value"
                nameKey="name"
                outerRadius={82}
                stroke="#fff"
                strokeWidth={2}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  name,
                  value,
                }) => {
                  const RADIAN = Math.PI / 180;

                  const radius =
                    innerRadius +
                    (outerRadius - innerRadius) * 0.5;

                  const x =
                    cx +
                    radius *
                    Math.cos(-midAngle * RADIAN);

                  const y =
                    cy +
                    radius *
                    Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#fff"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={7}
                      fontWeight={500}
                    >
                      <tspan
                        x={x}
                        dy="-7"
                      >
                        {name}
                      </tspan>

                      <tspan
                        x={x}
                        dy="16"
                        fontSize={8}
                      >
                        {value}
                      </tspan>
                    </text>
                  );
                }}
                labelLine={false}
              >
                {workingHoursData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={
                      workingColors[
                      index % workingColors.length
                      ]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                color: "#888",
              }}
            >
              No working hours data
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          maxHeight: 280,
          overflowY: "auto",
          pr: 0.5,

          "&::-webkit-scrollbar": {
            width: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#C8D1CD",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#F5F7F6",
          },
        }}
      >
        <Stack spacing={0.8}>
          {data.employees.map((employee) => {
            const statusColor =
              employee.status === "Extra Hours"
                ? "#17A673"
                : employee.status === "On Time"
                  ? "#F5A623"
                  : "#E51D2A";

            const avatar =
              employee.name?.charAt(0)?.toUpperCase() || "?";

            return (
              <Stack
                key={employee.employee_id}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  p: 0.6,
                  borderRadius: "10px",
                  "&:hover": {
                    backgroundColor: "#F8FAF9",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 11,
                  }}
                >
                  {avatar}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#333",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={employee.name}
                  >
                    {employee.name}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 7,
                      color: "#888",
                    }}
                  >
                    {employee.designation ||
                      employee.department ||
                      "Employee"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 0.8,
                    py: 0.5,
                    borderRadius: "8px",
                    minWidth: 68,
                    backgroundColor: `${statusColor}15`,
                    color: statusColor,
                  }}
                >
                  <AccessTime sx={{ fontSize: 12 }} />

                  <Box>
                    <Typography
                      component="b"
                      sx={{
                        display: "block",
                        fontSize: 7,
                      }}
                    >
                      {Number(
                        employee.working_hours || 0
                      ).toFixed(2)}{" "}
                      Hrs
                    </Typography>

                    <Typography
                      component="span"
                      sx={{
                        display: "block",
                        fontSize: 6,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {employee.status}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}

/* ------------------------------------------------ */
/* MAIN DASHBOARD */
/* ------------------------------------------------ */

export default function Dashboard() {
  const [period, setPeriod] = useState("today");

  const [dashboard, setDashboard] =
    useState(EMPTY_DASHBOARD);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const fetchDashboard = async (selectedPeriod) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${DASHBOARD_API}?period=${selectedPeriod}`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.status) {
        throw new Error(
          "Dashboard API returned unsuccessful response"
        );
      }

      setDashboard({
        ...EMPTY_DASHBOARD,
        ...result,

        staff_attendance: {
          ...EMPTY_DASHBOARD.staff_attendance,
          ...(result.staff_attendance || {}),
        },

        crew_attendance: {
          ...EMPTY_DASHBOARD.crew_attendance,
          ...(result.crew_attendance || {}),
        },

        crew_working_hours: {
          ...EMPTY_DASHBOARD.crew_working_hours,
          ...(result.crew_working_hours || {}),
        },

        assets_allocated: {
          ...EMPTY_DASHBOARD.assets_allocated,
          ...(result.assets_allocated || {}),
        },

        uniform: {
          ...EMPTY_DASHBOARD.uniform,
          ...(result.uniform || {}),
        },
      });
    } catch (err) {
      console.error(
        "Dashboard API Error:",
        err
      );

      setError(
        err.message ||
        "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(period);
  }, [period]);

  const handlePeriodChange = (newPeriod) => {
    if (newPeriod === period) return;

    setPeriod(newPeriod);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: 1.5,
        backgroundColor: "#F4F6F5",
        fontFamily: "Inter, Roboto, sans-serif",
        position: "relative",
      }}
    >
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            zIndex: 9999,
            backgroundColor: "#075C4D",
          }}
        >
          <LinearProgress
            sx={{
              height: 3,
              backgroundColor: "transparent",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#EF233C",
              },
            }}
          />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Box
          sx={{
            mb: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: "#FFF0F0",
            border: "1px solid #FFD5D5",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              color: "#C62828",
            }}
          >
            {error}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          width: "100%",
          maxWidth: 1500,
          mx: "auto",

          display: "grid",

          gridTemplateColumns:
            "28% 46% 26%",

          gap: 1,

          "@media (max-width: 1200px)": {
            gridTemplateColumns:
              "1fr 1.5fr",
          },

          "@media (max-width: 900px)": {
            gridTemplateColumns: "1fr",
          },
        }}
      >
        {/* LEFT COLUMN */}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <AttendanceCard
            data={dashboard.staff_attendance}
          />

          <Card
            sx={{
              height: 135,
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "none",
            }}
          >
            <Box
              component="img"
              src={team}
              alt="Emergency ambulance team"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Card>

          <LoginSummary
            data={
              dashboard.employees_login_summary
            }
          />
        </Box>

        {/* CENTER COLUMN */}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <HeroCard
            period={period}
            onPeriodChange={
              handlePeriodChange
            }
          />

          <UniformCard
            data={dashboard.uniform}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 1,

              "@media (max-width: 900px)": {
                gridTemplateColumns:
                  "1fr",
              },
            }}
          >
            <EmploymentType
              data={
                dashboard.employment_type
              }
            />

            <AssetsCard
              data={
                dashboard.assets_allocated
              }
            />
          </Box>
        </Box>

        {/* RIGHT COLUMN */}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,

            "@media (max-width: 1200px)": {
              gridColumn: "span 2",
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
            },

            "@media (max-width: 900px)": {
              gridColumn: "auto",
              display: "flex",
            },
          }}
        >
          <CrewAttendance
            data={
              dashboard.crew_attendance
            }
          />

          <WorkingHours
            data={
              dashboard.crew_working_hours
            }
          />
        </Box>
      </Box>
    </Box>
  );
}