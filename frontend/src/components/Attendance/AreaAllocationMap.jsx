// import React from "react";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
// } from "react-leaflet";

// import "leaflet/dist/leaflet.css";

// const AreaAllocationMap = ({ employees = [] }) => {
//   return (
//     <MapContainer
//       center={[18.5204, 73.8567]}
//       zoom={10}
//       zoomControl={true}
//       style={{
//         width: "100%",
//         height: "100%",
//       }}
//     >
//       <TileLayer
//         attribution="&copy; OpenStreetMap contributors"
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />

//       {employees.map((employee) => {
//         if (
//           !employee.latitude ||
//           !employee.longitude
//         ) {
//           return null;
//         }

//         return (
//           <Marker
//             key={employee.id}
//             position={[
//               employee.latitude,
//               employee.longitude,
//             ]}
//           >
//             <Popup>
//               <div>
//                 <strong>{employee.name}</strong>
//                 <br />
//                 Employee Code: {employee.code}
//                 <br />
//                 District: {employee.district}
//                 <br />

//                 Status:{" "}
//                 {employee.status === "late"
//                   ? "Late"
//                   : "Active"}

//                 {employee.status === "late" && (
//                   <>
//                     <br />
//                     Late by: {employee.lateMinutes} minutes
//                   </>
//                 )}
//               </div>
//             </Popup>
//           </Marker>
//         );
//       })}
//     </MapContainer>
//   );
// };

// export default AreaAllocationMap;












// import React from "react";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
// } from "react-leaflet";
// import L from "leaflet";

// import "leaflet/dist/leaflet.css";

// const STATUS_META = {
//   active: { color: "#10b981", label: "Active" },
//   late: { color: "#f59e0b", label: "Late" },
//   off: { color: "#ef4444", label: "Off duty" },
// };

// // Builds a colored circular divIcon with the employee's initials/code,
// // matching the reference UI (colored dot + white ring + code).
// function getEmployeeIcon(employee) {
//   const meta = STATUS_META[employee.status] || STATUS_META.active;

//   return L.divIcon({
//     className: "employee-marker-wrapper",
//     html: `
//       <div style="
//         display:flex;
//         align-items:center;
//         justify-content:center;
//         width:34px;
//         height:34px;
//         border-radius:50%;
//         border:3px solid #ffffff;
//         box-shadow:0 1px 4px rgba(0,0,0,0.35);
//         background:${meta.color};
//         color:#ffffff;
//         font-weight:700;
//         font-size:12px;
//         letter-spacing:0.2px;
//       ">
//         ${employee.code || ""}
//       </div>
//     `,
//     iconSize: [34, 34],
//     iconAnchor: [17, 17],
//     popupAnchor: [0, -17],
//   });
// }

// // Small legend overlay, positioned like the bottom-left legend in the
// // reference screenshot. Plain absolutely-positioned div — no Leaflet
// // control needed since we're inside React.
// function StatusLegend() {
//   return (
//     <div
//       style={{
//         position: "absolute",
//         bottom: 20,
//         left: 10,
//         zIndex: 1000,
//         background: "#ffffff",
//         padding: "10px 14px",
//         borderRadius: 8,
//         boxShadow: "0 1px 6px rgba(0,0,0,0.3)",
//         fontSize: 13,
//         color: "#1f2937",
//         lineHeight: 1.9,
//       }}
//     >
//       <div style={{ fontWeight: 700, marginBottom: 4 }}>Status</div>
//       {Object.values(STATUS_META).map((meta) => (
//         <div key={meta.label}>
//           <span
//             style={{
//               display: "inline-block",
//               width: 10,
//               height: 10,
//               borderRadius: "50%",
//               marginRight: 8,
//               background: meta.color,
//             }}
//           />
//           {meta.label}
//         </div>
//       ))}
//     </div>
//   );
// }

// const AreaAllocationMap = ({ employees = [] }) => {
//   return (
//     <div style={{ position: "relative", width: "100%", height: "100%" }}>
//       <MapContainer
//         center={[54.59697322074422, -5.930111466638566]}
//         zoom={10}
//         zoomControl={true}
//         style={{
//           width: "100%",
//           height: "100%",
//         }}
//       >
//         <TileLayer
//           attribution="&copy; OpenStreetMap contributors"
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {employees.map((employee) => {
//           if (!employee.latitude || !employee.longitude) {
//             return null;
//           }

//           const meta = STATUS_META[employee.status] || STATUS_META.active;

//           return (
//             <Marker
//               key={employee.id}
//               position={[employee.latitude, employee.longitude]}
//               icon={getEmployeeIcon(employee)}
//             >
//               <Popup>
//                 <div>
//                   <strong>{employee.name}</strong>
//                   <br />
//                   Employee Code: {employee.code}
//                   <br />
//                   District: {employee.district}
//                   <br />

//                   Status:{" "}
//                   <span
//                     style={{
//                       display: "inline-block",
//                       marginTop: 4,
//                       padding: "2px 8px",
//                       borderRadius: 10,
//                       fontSize: 11,
//                       fontWeight: 700,
//                       color: "#fff",
//                       background: meta.color,
//                     }}
//                   >
//                     {meta.label}
//                   </span>

//                   {employee.status === "late" && (
//                     <>
//                       <br />
//                       Late by: {employee.lateMinutes} minutes
//                     </>
//                   )}
//                 </div>
//               </Popup>
//             </Marker>
//           );
//         })}
//       </MapContainer>

//       <StatusLegend />
//     </div>
//   );
// };

// export default AreaAllocationMap;














import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ZoomControl
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const STATUS_META = {
  active: { color: "#10b981", label: "Active" },
  late: { color: "#f59e0b", label: "Late" },
  off: { color: "#ef4444", label: "Off duty" },
};

const DEFAULT_CENTER = [54.59697322074422, -5.930111466638566];
const DEFAULT_ZOOM = 10;


// --------------------------------------------------
// Employee Icon
// --------------------------------------------------
function getEmployeeIcon(employee) {
  const meta = STATUS_META[employee.status] || STATUS_META.active;

  // return L.divIcon({
  //   className: "employee-marker-wrapper",

  //   html: `
  //     <div style="
  //       display:flex;
  //       align-items:center;
  //       justify-content:center;
  //       width:44px;
  //       height:44px;
  //       border-radius:50%;
  //       border:3px solid #ffffff;
  //       box-shadow:0 1px 4px rgba(0,0,0,0.35);
  //       background:${meta.color};
  //       color:#ffffff;
  //       font-weight:700;
  //       font-size:12px;
  //       letter-spacing:0.2px;
  //     ">
  //       ${employee.code || ""}
  //     </div>
  //   `,

  //   iconSize: [34, 34],
  //   iconAnchor: [17, 17],
  //   popupAnchor: [0, -17],
  // });



  const code = employee.code || "";

const fontSize =
  code.length > 7 ? "8px" :
  code.length > 5 ? "9px" :
  "11px";

return L.divIcon({
  className: "employee-marker-wrapper",

  html: `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:40px;
      height:40px;
      border-radius:50%;
      border:3px solid #ffffff;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
      background:${meta.color};
      color:#ffffff;
      font-weight:700;
      font-size:${fontSize};
      letter-spacing:0;
      white-space:nowrap;
      box-sizing:border-box;
      overflow:hidden;
    ">
      ${code}
    </div>
  `,

  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});
}


// --------------------------------------------------
// Dynamic Map Zoom
// --------------------------------------------------
// function DynamicMapZoom({ employees }) {
//   const map = useMap();

//   useEffect(() => {

//     // Get only valid coordinates
//     const validEmployees = employees.filter(
//       (employee) =>
//         employee.latitude !== null &&
//         employee.latitude !== undefined &&
//         employee.longitude !== null &&
//         employee.longitude !== undefined &&
//         !isNaN(Number(employee.latitude)) &&
//         !isNaN(Number(employee.longitude))
//     );

//     // ---------------------------------------------
//     // No employee data
//     // ---------------------------------------------
//     if (validEmployees.length === 0) {
//       map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
//       return;
//     }

//     // ---------------------------------------------
//     // One employee
//     // ---------------------------------------------
//     if (validEmployees.length === 1) {
//       const employee = validEmployees[0];

//       map.setView(
//         [
//           Number(employee.latitude),
//           Number(employee.longitude),
//         ],
//         15,
//         {
//           animate: true,
//         }
//       );

//       return;
//     }

//     // ---------------------------------------------
//     // Multiple employees
//     // ---------------------------------------------
//     const bounds = L.latLngBounds(
//       validEmployees.map((employee) => [
//         Number(employee.latitude),
//         Number(employee.longitude),
//       ])
//     );

//     // Automatically calculate zoom based on
//     // the geographical spread of the employees.
//     map.fitBounds(bounds, {
//       padding: [50, 50],
//       maxZoom: 15,
//       animate: true,
//     });

//   }, [employees, map]);

//   return null;
// }


function DynamicMapZoom({ employees }) {
  const map = useMap();

  useEffect(() => {
    // Keep only employees having valid numeric coordinates
    const validEmployees = employees.filter((employee) => {
      const lat = Number(employee.latitude);
      const lng = Number(employee.longitude);

      return (
        employee.latitude !== null &&
        employee.latitude !== undefined &&
        employee.longitude !== null &&
        employee.longitude !== undefined &&
        employee.latitude !== "" &&
        employee.longitude !== "" &&
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      );
    });

    console.log("Total employees:", employees.length);
    console.log("Valid employees for map:", validEmployees.length);

    // -----------------------------------------
    // No valid coordinates
    // -----------------------------------------
    if (validEmployees.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    // -----------------------------------------
    // Only one valid employee
    // -----------------------------------------
    if (validEmployees.length === 1) {
      const employee = validEmployees[0];

      map.setView(
        [
          Number(employee.latitude),
          Number(employee.longitude),
        ],
        15,
        {
          animate: true,
        }
      );

      return;
    }

    // -----------------------------------------
    // Multiple valid employees
    // -----------------------------------------
    const bounds = L.latLngBounds(
      validEmployees.map((employee) => [
        Number(employee.latitude),
        Number(employee.longitude),
      ])
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
      animate: true,
    });
  }, [employees, map]);

  return null;
}




// --------------------------------------------------
// Status Legend
// --------------------------------------------------
function StatusLegend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 10,
        zIndex: 1000,
        background: "#ffffff",
        padding: "10px 14px",
        borderRadius: 8,
        boxShadow: "0 1px 6px rgba(0,0,0,0.3)",
        fontSize: 13,
        color: "#1f2937",
        lineHeight: 1.9,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        Status
      </div>

      {Object.values(STATUS_META).map((meta) => (
        <div key={meta.label}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              marginRight: 8,
              background: meta.color,
            }}
          />

          {meta.label}
        </div>
      ))}
    </div>
  );
}


// --------------------------------------------------
// Main Map
// --------------------------------------------------
// const AreaAllocationMap = ({ employees = [] }) => {

//   return (
//     <div
//       style={{
//         position: "relative",
//         width: "100%",
//         height: "100%",
//       }}
//     >
//       <MapContainer
//         center={DEFAULT_CENTER}
//         zoom={DEFAULT_ZOOM}
//         zoomControl={true}
//         style={{
//           width: "100%",
//           height: "100%",
//         }}
//       >

//         <TileLayer
//           attribution="&copy; OpenStreetMap contributors"
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {/* Dynamic zoom based on API data */}
//         <DynamicMapZoom employees={employees} />

//         {/* Employee markers */}
//         {employees.map((employee) => {

//           if (
//             employee.latitude === null ||
//             employee.latitude === undefined ||
//             employee.longitude === null ||
//             employee.longitude === undefined
//           ) {
//             return null;
//           }

//           const meta =
//             STATUS_META[employee.status] ||
//             STATUS_META.active;

//           return (
//             <Marker
//               key={employee.id}
//               position={[
//                 Number(employee.latitude),
//                 Number(employee.longitude),
//               ]}
//               icon={getEmployeeIcon(employee)}
//             >

//               <Popup>
//                 <div>

//                   <strong>{employee.name}</strong>

//                   <br />

//                   Employee Code: {employee.code}

//                   <br />

//                   District: {employee.district}

//                   <br />

//                   Status:{" "}

//                   <span
//                     style={{
//                       display: "inline-block",
//                       marginTop: 4,
//                       padding: "2px 8px",
//                       borderRadius: 10,
//                       fontSize: 11,
//                       fontWeight: 700,
//                       color: "#fff",
//                       background: meta.color,
//                     }}
//                   >
//                     {meta.label}
//                   </span>

//                   {employee.status === "late" && (
//                     <>
//                       <br />
//                       Late by: {employee.lateMinutes} minutes
//                     </>
//                   )}

//                 </div>
//               </Popup>

//             </Marker>
//           );
//         })}

//       </MapContainer>

//       <StatusLegend />
//     </div>
//   );
// };

const AreaAllocationMap = ({ employees = [] }) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <ZoomControl position="topright" />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <DynamicMapZoom employees={employees} />

        {employees.map((employee) => {
          if (
            employee.latitude === null ||
            employee.latitude === undefined ||
            employee.longitude === null ||
            employee.longitude === undefined
          ) {
            return null;
          }

          const meta =
            STATUS_META[employee.status] ||
            STATUS_META.active;

          return (
            <Marker
              key={employee.id}
              position={[
                Number(employee.latitude),
                Number(employee.longitude),
              ]}
              icon={getEmployeeIcon(employee)}
            >
              <Popup>
                <div>
                  <strong>{employee.name}</strong>
                  <br />
                  Employee Code: {employee.code}
                  <br />
                  District: {employee.district}
                  <br />
                  Status:{" "}
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 4,
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      background: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>

                  {employee.status === "late" && (
                    <>
                      <br />
                      Late by: {employee.lateMinutes} minutes
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <StatusLegend />
    </div>
  );
};


export default AreaAllocationMap;

