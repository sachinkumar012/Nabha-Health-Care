import React, { useState } from "react";
import { Box, Typography, IconButton, Slide } from "@mui/material";
import { X, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";

const OfflineIndicator = ({ show }) => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!show || dismissed) {
    return null;
  }

  return (
    <Slide direction="down" in={show} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bgcolor: "#ff9800",
          color: "white",
          py: 1,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          zIndex: 2000,
          boxShadow: 2,
        }}
      >
        <WifiOff size={20} />

        <Typography variant="body2" sx={{ flex: 1, textAlign: "center" }}>
          {t("offline.message")}
        </Typography>

        <IconButton
          size="small"
          onClick={handleDismiss}
          sx={{ color: "inherit" }}
          aria-label={t("offline.hide")}
        >
          <X size={16} />
        </IconButton>
      </Box>
    </Slide>
  );
};

export default OfflineIndicator;
