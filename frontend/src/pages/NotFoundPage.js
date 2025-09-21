import React from "react";
import { Box, Container, Typography, Button, Paper, Grid } from "@mui/material";
import { Home, ArrowBack, SearchOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../components/Layout/Layout";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: "center",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          }}
        >
          <Box sx={{ mb: 4 }}>
            <SearchOff
              sx={{
                fontSize: 120,
                color: "primary.main",
                opacity: 0.7,
                mb: 2,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "4rem", md: "6rem" },
                fontWeight: "bold",
                color: "primary.main",
                opacity: 0.8,
                mb: 2,
              }}
            >
              404
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontWeight: 500,
                color: "text.primary",
              }}
            >
              {t("notFound.title", "Page Not Found")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
            >
              {t(
                "notFound.description",
                "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
              )}
            </Typography>
          </Box>

          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                size="large"
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                }}
              >
                {t("notFound.goHome", "Go Home")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                }}
              >
                {t("notFound.goBack", "Go Back")}
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">
              {t(
                "notFound.helpText",
                "If you believe this is an error, please contact our support team."
              )}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default NotFoundPage;
