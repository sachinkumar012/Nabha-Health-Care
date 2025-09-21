import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Slide,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { X, Download, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

const PWAInstallPrompt = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem("pwa_prompt_dismissed");
      const lastDismissed = localStorage.getItem("pwa_prompt_last_dismissed");
      const now = new Date().getTime();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;

      // Show prompt if not dismissed, or if more than a week has passed
      if (
        !dismissed ||
        (lastDismissed && now - parseInt(lastDismissed) > oneWeek)
      ) {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      localStorage.setItem("pwa_installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
    localStorage.setItem(
      "pwa_prompt_last_dismissed",
      new Date().getTime().toString()
    );
  };

  const handleLater = () => {
    setShowPrompt(false);
    // Don't mark as permanently dismissed, just hide for this session
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Slide direction="up" in={showPrompt} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          left: 16,
          right: 16,
          maxWidth: 400,
          mx: "auto",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 2,
          p: 3,
          boxShadow: 4,
          zIndex: 1500,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Smartphone size={32} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {t("pwa.install")}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t("pwa.installPrompt")}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleDismiss}
            sx={{ color: "inherit", mt: -1, mr: -1 }}
          >
            <X size={20} />
          </IconButton>
        </Box>

        {/* Benefits */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            ✓ {t("pwa.benefits.offline")}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            ✓ {t("pwa.benefits.fast")}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            ✓ {t("pwa.benefits.convenient")}
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={handleInstall}
            startIcon={<Download size={16} />}
            fullWidth={isMobile}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            {t("pwa.install")}
          </Button>

          <Button
            variant="text"
            onClick={handleLater}
            fullWidth={isMobile}
            sx={{
              color: "inherit",
              opacity: 0.8,
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
                opacity: 1,
              },
            }}
          >
            {t("pwa.later")}
          </Button>
        </Box>
      </Box>
    </Slide>
  );
};

export default PWAInstallPrompt;
