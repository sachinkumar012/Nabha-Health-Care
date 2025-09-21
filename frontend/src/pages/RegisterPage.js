import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  LocationOn,
  LocalHospital,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import authAPI from "../services/api/auth";

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    phone: "",
    address: "",
    village: "",
    specialization: "",
    licenseNumber: "",
    pharmacyName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const steps = [
    t("auth.personalInfo"),
    t("auth.contactInfo"),
    t("auth.professionalInfo"),
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.name || !formData.email) {
          setError(t("auth.requiredFields"));
          return false;
        }
        if (!formData.email.includes("@")) {
          setError(t("auth.invalidEmail"));
          return false;
        }
        return true;
      case 1:
        if (
          !formData.password ||
          !formData.confirmPassword ||
          !formData.phone
        ) {
          setError(t("auth.requiredFields"));
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError(t("auth.passwordMismatch"));
          return false;
        }
        if (formData.password.length < 6) {
          setError(t("auth.passwordTooShort"));
          return false;
        }
        return true;
      case 2:
        if (formData.role === "doctor" && !formData.specialization) {
          setError(t("auth.specializationRequired"));
          return false;
        }
        if (formData.role === "pharmacist" && !formData.pharmacyName) {
          setError(t("auth.pharmacyNameRequired"));
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(activeStep)) return;

    setLoading(true);
    setError("");

    try {
      await authAPI.register(formData);
      navigate("/login", {
        state: { message: t("auth.registrationSuccess") },
      });
    } catch (error) {
      setError(error.response?.data?.message || t("auth.registrationError"));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              name="name"
              label={t("auth.fullName")}
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              name="email"
              label={t("auth.email")}
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t("auth.role")}</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label={t("auth.role")}
                onChange={handleChange}
              >
                <MenuItem value="patient">{t("roles.patient")}</MenuItem>
                <MenuItem value="doctor">{t("roles.doctor")}</MenuItem>
                <MenuItem value="pharmacist">{t("roles.pharmacist")}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              name="password"
              label={t("auth.password")}
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              name="confirmPassword"
              label={t("auth.confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              name="phone"
              label={t("auth.phone")}
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <TextField
              fullWidth
              name="address"
              label={t("auth.address")}
              multiline
              rows={2}
              value={formData.address}
              onChange={handleChange}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              name="village"
              label={t("auth.village")}
              value={formData.village}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            {formData.role === "doctor" && (
              <>
                <TextField
                  fullWidth
                  name="specialization"
                  label={t("auth.specialization")}
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  name="licenseNumber"
                  label={t("auth.licenseNumber")}
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </>
            )}
            {formData.role === "pharmacist" && (
              <TextField
                fullWidth
                name="pharmacyName"
                label={t("auth.pharmacyName")}
                value={formData.pharmacyName}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <LocalHospital
              sx={{
                m: 1,
                bgcolor: "primary.main",
                color: "white",
                borderRadius: "50%",
                p: 2,
                fontSize: 40,
              }}
            />
            <Typography
              component="h1"
              variant="h4"
              color="primary"
              gutterBottom
            >
              {t("common.appName")}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {t("auth.registerTitle")}
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                {t("common.back")}
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              {activeStep === steps.length - 1 ? (
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? t("common.loading") : t("auth.register")}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  {t("common.next")}
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary">
                {t("auth.haveAccount")}
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
