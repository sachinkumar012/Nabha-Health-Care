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
  Grid,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  LocalHospital,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import authAPI from "../services/api/auth";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "patient",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData);
      login(response.data.user, response.data.token);

      // Redirect based on role
      switch (response.data.user.role) {
        case "doctor":
          navigate("/doctor-dashboard");
          break;
        case "pharmacist":
          navigate("/pharmacy-dashboard");
          break;
        case "admin":
          navigate("/admin-dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
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
              {t("auth.loginTitle")}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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
                <MenuItem value="admin">{t("roles.admin")}</MenuItem>
              </Select>
            </FormControl>

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

            <TextField
              fullWidth
              name="password"
              label={t("auth.password")}
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? t("common.loading") : t("auth.login")}
            </Button>

            <Grid container>
              <Grid item xs>
                <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                  <Typography variant="body2" color="primary">
                    {t("auth.forgotPassword")}
                  </Typography>
                </Link>
              </Grid>
              <Grid item>
                <Link to="/register" style={{ textDecoration: "none" }}>
                  <Typography variant="body2" color="primary">
                    {t("auth.noAccount")}
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mt: 2 }}
        >
          {t("common.tagline")}
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;
