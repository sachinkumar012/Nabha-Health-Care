import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Badge,
} from "@mui/material";
import {
  CalendarToday,
  LocalHospital,
  MedicalServices,
  Assignment,
  Notifications,
  VideoCall,
  History,
  Add,
  AccessTime,
  Person,
  Phone,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import appointmentAPI from "../services/api/appointments";
import healthRecordAPI from "../services/api/healthRecords";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalRecords: 0,
    pendingResults: 0,
    notifications: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch upcoming appointments
      const appointmentsResponse = await appointmentAPI.getUpcoming();
      const appointments = appointmentsResponse.data.appointments || [];
      setUpcomingAppointments(appointments.slice(0, 3)); // Show only first 3

      // Fetch health records count
      const recordsResponse = await healthRecordAPI.getAll();
      const records = recordsResponse.data.records || [];

      // Update stats
      setStats({
        upcomingAppointments: appointments.length,
        totalRecords: records.length,
        pendingResults: records.filter((r) => r.status === "pending").length,
        notifications: 5, // Mock notifications
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: "appointment",
          title: t("dashboard.appointmentCompleted"),
          description: t("dashboard.withDrSharma"),
          time: "2 hours ago",
          icon: MedicalServices,
        },
        {
          id: 2,
          type: "record",
          title: t("dashboard.newLabResults"),
          description: t("dashboard.bloodTestResults"),
          time: "1 day ago",
          icon: Assignment,
        },
        {
          id: 3,
          type: "medicine",
          title: t("dashboard.medicineReminder"),
          description: t("dashboard.timeToTakeMedicine"),
          time: "2 days ago",
          icon: LocalHospital,
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.goodMorning");
    if (hour < 17) return t("dashboard.goodAfternoon");
    return t("dashboard.goodEvening");
  };

  const formatAppointmentTime = (dateTime) => {
    const date = new Date(dateTime);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const quickActions = [
    {
      title: t("dashboard.bookAppointment"),
      description: t("dashboard.scheduleConsultation"),
      icon: CalendarToday,
      color: "primary",
      action: () => navigate("/appointments/book"),
    },
    {
      title: t("dashboard.symptomChecker"),
      description: t("dashboard.checkSymptoms"),
      icon: MedicalServices,
      color: "secondary",
      action: () => navigate("/symptom-checker"),
    },
    {
      title: t("dashboard.findMedicine"),
      description: t("dashboard.searchNearbyPharmacies"),
      icon: LocalHospital,
      color: "success",
      action: () => navigate("/medicines"),
    },
    {
      title: t("dashboard.healthRecords"),
      description: t("dashboard.viewMedicalHistory"),
      icon: Assignment,
      color: "info",
      action: () => navigate("/health-records"),
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
        }}
      >
        <Box display="flex" alignItems="center" color="white">
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 64,
              height: 64,
              mr: 2,
            }}
          >
            <Person fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {getGreeting()}, {user?.name}!
            </Typography>
            <Typography variant="subtitle1">
              {t("dashboard.welcomeMessage")}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t("dashboard.upcomingAppointments")}
                  </Typography>
                  <Typography variant="h4">
                    {stats.upcomingAppointments}
                  </Typography>
                </Box>
                <CalendarToday color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t("dashboard.healthRecords")}
                  </Typography>
                  <Typography variant="h4">{stats.totalRecords}</Typography>
                </Box>
                <Assignment color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t("dashboard.pendingResults")}
                  </Typography>
                  <Typography variant="h4">{stats.pendingResults}</Typography>
                </Box>
                <MedicalServices color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t("dashboard.notifications")}
                  </Typography>
                  <Typography variant="h4">{stats.notifications}</Typography>
                </Box>
                <Badge badgeContent={stats.notifications} color="error">
                  <Notifications color="secondary" sx={{ fontSize: 40 }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t("dashboard.quickActions")}
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                }}
                onClick={action.action}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <action.icon
                    color={action.color}
                    sx={{ fontSize: 48, mb: 1 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">
                {t("dashboard.upcomingAppointments")}
              </Typography>
              <Button
                startIcon={<Add />}
                onClick={() => navigate("/appointments")}
              >
                {t("dashboard.viewAll")}
              </Button>
            </Box>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <Card key={appointment._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box flex={1}>
                        <Typography variant="subtitle1" gutterBottom>
                          Dr. {appointment.doctor?.name || "Unknown"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                        >
                          {appointment.doctor?.specialization}
                        </Typography>
                        <Box display="flex" alignItems="center" mb={1}>
                          <AccessTime fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {formatAppointmentTime(appointment.date)}
                          </Typography>
                        </Box>
                        <Chip
                          label={appointment.status}
                          size="small"
                          color={
                            appointment.status === "confirmed"
                              ? "success"
                              : "warning"
                          }
                        />
                      </Box>
                      <CardActions>
                        <IconButton color="primary">
                          <VideoCall />
                        </IconButton>
                        <IconButton color="primary">
                          <Phone />
                        </IconButton>
                      </CardActions>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
                py={4}
              >
                {t("dashboard.noUpcomingAppointments")}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("dashboard.recentActivity")}
            </Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemIcon>
                      <activity.icon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            <Box textAlign="center" mt={2}>
              <Button startIcon={<History />}>
                {t("dashboard.viewAllActivity")}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
