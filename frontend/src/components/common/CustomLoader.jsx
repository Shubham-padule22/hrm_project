import { Box, Typography } from "@mui/material";

const CustomLoader = ({
  message = "Loading module data...",
  height = "350px",
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight={height}
      sx={{
        width: "100%",
        backgroundColor: "transparent",
        position: "relative",
        overflow: "hidden",
        gap: 2.5,
      }}
    >
      {/* Subtle background glow container */}
      <Box
        sx={{
          position: "absolute",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(1, 156, 218, 0.15) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(10px)",
          zIndex: 0,
        }}
      />

      {/* Loader Spinner Stack */}
      <Box position="relative" display="inline-flex" sx={{ zIndex: 1 }}>
        {/* Outer track ring */}
      

        {/* Primary rotating gradient spinner */}
    

        {/* Inner core decorative pulsing dot/ring */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: "#019cda",
            boxShadow: "0 0 10px #019cda",
            animation: "corePulse 1.8s infinite ease-in-out",
            "@keyframes corePulse": {
              "0%": {
                transform: "translate(-50%, -50%) scale(0.8)",
                opacity: 0.5,
              },
              "50%": {
                transform: "translate(-50%, -50%) scale(1.2)",
                opacity: 1,
              },
              "100%": {
                transform: "translate(-50%, -50%) scale(0.8)",
                opacity: 0.5,
              },
            },
          }}
        />
      </Box>

      {/* Premium Typography with Shimmer/Pulse effect */}
      {message && (
        <Typography
          variant="body2"
          sx={{
            color: "#b0b0b0",
            fontWeight: 500,
            letterSpacing: "1.2px",
            fontSize: "13px",
            zIndex: 1,
            animation: "textFade 1.5s infinite ease-in-out",
            "@keyframes textFade": {
              "0%": { opacity: 0.5 },
              "50%": { opacity: 1 },
              "100%": { opacity: 0.5 },
            },
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default CustomLoader;
