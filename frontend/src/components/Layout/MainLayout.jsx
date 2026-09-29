import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function MainLayout() {
  return (
  
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* 2. Header */}
      <Box sx={{ flexShrink: 0 }}>
        <Header />
      </Box>

      {/* Sidebar + Main Content Wrapper */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* 3. Sidebar */}
        <Box
          sx={{
            flexShrink: 0,
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            // ...premiumScrollbar, 
          }}
        >
          <Sidebar />
        </Box>

        {/* 4. Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f5f7fb",
            overflowY: "auto",
            overflowX: "hidden",
            boxSizing: "border-box",
            // ...premiumScrollbar, 
          }}
        >
          {/* Main Page Content */}
          <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 3,
          py:1,
          marginLeft: "60px", 
        
          width: "calc(100% - 88px)",
        }}
      >
        <Outlet />
     
        
          </Box>

          {/* Footer */}
          <Box sx={{ flexShrink: 0 }}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
