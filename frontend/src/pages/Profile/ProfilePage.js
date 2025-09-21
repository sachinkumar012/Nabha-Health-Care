import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Edit,
  Security,
  Notifications,
  Language,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout/Layout";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const profileSections = [
    {
      title: t("profile.personalInfo"),
      items: [
        {
          icon: <Person />,
          label: t("profile.name"),
          value: user?.name || "N/A",
        },
        {
          icon: <Email />,
          label: t("profile.email"),
          value: user?.email || "N/A",
        },
        {
          icon: <Phone />,
          label: t("profile.phone"),
          value: user?.phone || "N/A",
        },
        {
          icon: <LocationOn />,
          label: t("profile.village"),
          value: user?.village || "N/A",
        },
        {
          icon: <CalendarToday />,
          label: t("profile.dateOfBirth"),
          value: user?.dateOfBirth
            ? new Date(user.dateOfBirth).toLocaleDateString()
            : "N/A",
        },
      ],
    },
  ];

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main" }}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {user?.name || t("profile.noName")}
              </Typography>
              <Chip
                label={user?.role || "Patient"}
                color="primary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
              {user?.isVerified && (
                <Chip
                  label={t("profile.verified")}
                  color="success"
                  variant="outlined"
                />
              )}
            </Grid>
            <Grid item>
              <Button variant="outlined" startIcon={<Edit />} sx={{ mr: 1 }}>
                {t("profile.edit")}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={8}>
            {profileSections.map((section, index) => (
              <Paper key={index} elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {section.title}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {section.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex} sx={{ px: 0 }}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.value}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ))}
          </Grid>

          {/* Settings Panel */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t("profile.quickSettings")}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem button>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText primary={t("profile.security")} />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText primary={t("profile.notifications")} />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <Language />
                  </ListItemIcon>
                  <ListItemText primary={t("profile.language")} />
                </ListItem>
              </List>
            </Paper>

            {/* Health Stats */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t("profile.healthStats")}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {t("profile.noHealthData")}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default ProfilePage;
