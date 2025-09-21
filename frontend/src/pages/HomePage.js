import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  LocalHospital,
  CalendarToday,
  MedicalServices,
  Assignment,
  Psychology,
  Phone,
  Language,
  Security,
  Speed,
  Accessibility,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <CalendarToday />,
      title: t("features.telemedicine"),
      description: t("features.telemedicineDesc"),
      action: () => navigate(user ? "/appointments" : "/login"),
    },
    {
      icon: <Psychology />,
      title: t("features.symptomChecker"),
      description: t("features.symptomCheckerDesc"),
      action: () => navigate("/symptom-checker"),
    },
    {
      icon: <LocalHospital />,
      title: t("features.medicines"),
      description: t("features.medicinesDesc"),
      action: () => navigate("/medicines"),
    },
    {
      icon: <Assignment />,
      title: t("features.healthRecords"),
      description: t("features.healthRecordsDesc"),
      action: () => navigate(user ? "/health-records" : "/login"),
    },
  ];

  const benefits = [
    {
      icon: <Language />,
      title: t("benefits.multilingual"),
      description: t("benefits.multilingualDesc"),
    },
    {
      icon: <Accessibility />,
      title: t("benefits.accessibility"),
      description: t("benefits.accessibilityDesc"),
    },
    {
      icon: <Speed />,
      title: t("benefits.fastAccess"),
      description: t("benefits.fastAccessDesc"),
    },
    {
      icon: <Security />,
      title: t("benefits.security"),
      description: t("benefits.securityDesc"),
    },
  ];

  const stats = [
    { number: "173", label: t("stats.villages") },
    { number: "50,000+", label: t("stats.residents") },
    { number: "24/7", label: t("stats.availability") },
    { number: "3", label: t("stats.languages") },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 8,
          px: 4,
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Box textAlign="center">
          <LocalHospital sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            {t("common.appName")}
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            {t("common.tagline")}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
            {t("home.description")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {user ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/dashboard")}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                {t("home.gotoDashboard")}
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/register")}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  {t("home.getStarted")}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/symptom-checker")}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  {t("home.trySymptomChecker")}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Statistics Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" textAlign="center" gutterBottom>
          {t("home.servingNabha")}
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box textAlign="center">
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {stat.number}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" textAlign="center" gutterBottom>
          {t("home.ourServices")}
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="textSecondary"
          sx={{ mb: 4 }}
        >
          {t("home.servicesDescription")}
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
                onClick={feature.action}
              >
                <CardContent sx={{ textAlign: "center", pb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 64,
                      height: 64,
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pt: 0 }}>
                  <Button size="small" color="primary">
                    {t("home.learnMore")}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Benefits Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" textAlign="center" gutterBottom>
          {t("home.whyChooseUs")}
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Avatar sx={{ bgcolor: "secondary.main", mt: 1 }}>
                  {benefit.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {benefit.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Emergency Section */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 6,
          bgcolor: "error.main",
          color: "white",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" gutterBottom>
          {t("home.emergencyTitle")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {t("home.emergencyDescription")}
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Phone />}
          onClick={() => window.open("tel:108")}
          sx={{
            bgcolor: "white",
            color: "error.main",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          {t("home.call108")}
        </Button>
      </Paper>

      {/* Language Support */}
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          {t("home.availableLanguages")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip label="English" variant="outlined" />
          <Chip label="हिंदी" variant="outlined" />
          <Chip label="ਪੰਜਾਬੀ" variant="outlined" />
        </Box>
      </Box>

      {/* Call to Action */}
      {!user && (
        <Paper
          elevation={2}
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          <Typography variant="h5" gutterBottom>
            {t("home.readyToStart")}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {t("home.joinCommunity")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/register")}
            sx={{
              bgcolor: "white",
              color: "primary.main",
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            {t("home.signUpFree")}
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default HomePage;
