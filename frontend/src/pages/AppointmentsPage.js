import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Alert,
} from "@mui/material";
import {
  Add,
  CalendarToday,
  AccessTime,
  Person,
  VideoCall,
  Phone,
  Edit,
  Cancel,
  FilterList,
  Search,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import appointmentAPI from "../services/api/appointments";
import doctorAPI from "../services/api/doctors";

const AppointmentsPage = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openBooking, setOpenBooking] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [bookingForm, setBookingForm] = useState({
    doctor: "",
    date: new Date(),
    time: new Date(),
    type: "consultation",
    reason: "",
    symptoms: "",
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAll();
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await doctorAPI.getAll();
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleBookingChange = (field, value) => {
    setBookingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBookAppointment = async () => {
    try {
      const appointmentData = {
        ...bookingForm,
        date: new Date(
          bookingForm.date.getFullYear(),
          bookingForm.date.getMonth(),
          bookingForm.date.getDate(),
          bookingForm.time.getHours(),
          bookingForm.time.getMinutes()
        ),
      };

      await appointmentAPI.create(appointmentData);
      setOpenBooking(false);
      setBookingForm({
        doctor: "",
        date: new Date(),
        time: new Date(),
        type: "consultation",
        reason: "",
        symptoms: "",
      });
      fetchAppointments();
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await appointmentAPI.cancel(appointmentId);
      fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      case "completed":
        return "info";
      default:
        return "default";
    }
  };

  const formatAppointmentDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const filteredAppointments = appointments
    .filter((appointment) => {
      if (filter !== "all" && appointment.status !== filter) return false;
      if (
        searchTerm &&
        !appointment.doctor?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcomingAppointments = filteredAppointments.filter(
    (appointment) =>
      new Date(appointment.date) > new Date() &&
      appointment.status !== "cancelled"
  );

  const pastAppointments = filteredAppointments.filter(
    (appointment) =>
      new Date(appointment.date) <= new Date() ||
      appointment.status === "cancelled"
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          {t("appointments.title")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenBooking(true)}
        >
          {t("appointments.bookNew")}
        </Button>
      </Box>

      {/* Filters and Search */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder={t("appointments.searchDoctor")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label={t("appointments.filterByStatus")}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <FilterList sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            >
              <MenuItem value="all">{t("appointments.allStatus")}</MenuItem>
              <MenuItem value="pending">{t("appointments.pending")}</MenuItem>
              <MenuItem value="confirmed">
                {t("appointments.confirmed")}
              </MenuItem>
              <MenuItem value="completed">
                {t("appointments.completed")}
              </MenuItem>
              <MenuItem value="cancelled">
                {t("appointments.cancelled")}
              </MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Upcoming Appointments */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("appointments.upcoming")} ({upcomingAppointments.length})
        </Typography>
        {upcomingAppointments.length > 0 ? (
          <Grid container spacing={2}>
            {upcomingAppointments.map((appointment) => {
              const dateTime = formatAppointmentDateTime(appointment.date);
              return (
                <Grid item xs={12} md={6} lg={4} key={appointment._id}>
                  <Card
                    sx={{
                      height: "100%",
                      border: "1px solid",
                      borderColor: "primary.light",
                    }}
                  >
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={2}
                      >
                        <Typography variant="h6">
                          Dr. {appointment.doctor?.name || "Unknown"}
                        </Typography>
                        <Chip
                          label={appointment.status}
                          size="small"
                          color={getStatusColor(appointment.status)}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        {appointment.doctor?.specialization}
                      </Typography>

                      <Box display="flex" alignItems="center" mb={1}>
                        <CalendarToday
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2">{dateTime.date}</Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={2}>
                        <AccessTime
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2">{dateTime.time}</Typography>
                      </Box>

                      {appointment.reason && (
                        <Typography variant="body2" color="textSecondary">
                          <strong>{t("appointments.reason")}:</strong>{" "}
                          {appointment.reason}
                        </Typography>
                      )}
                    </CardContent>

                    <CardActions>
                      <Button size="small" startIcon={<VideoCall />}>
                        {t("appointments.joinVideo")}
                      </Button>
                      <IconButton size="small" color="primary">
                        <Phone />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleCancelAppointment(appointment._id)}
                      >
                        <Cancel />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Alert severity="info">{t("appointments.noUpcoming")}</Alert>
        )}
      </Paper>

      {/* Past Appointments */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("appointments.past")} ({pastAppointments.length})
        </Typography>
        {pastAppointments.length > 0 ? (
          <List>
            {pastAppointments.map((appointment) => {
              const dateTime = formatAppointmentDateTime(appointment.date);
              return (
                <ListItem key={appointment._id}>
                  <ListItemIcon>
                    <Person color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Dr. ${appointment.doctor?.name || "Unknown"}`}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {appointment.doctor?.specialization}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {dateTime.date} at {dateTime.time}
                        </Typography>
                        {appointment.reason && (
                          <Typography variant="body2">
                            {t("appointments.reason")}: {appointment.reason}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Chip
                    label={appointment.status}
                    size="small"
                    color={getStatusColor(appointment.status)}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Alert severity="info">{t("appointments.noPast")}</Alert>
        )}
      </Paper>

      {/* Booking Dialog */}
      <Dialog
        open={openBooking}
        onClose={() => setOpenBooking(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("appointments.bookNew")}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              select
              label={t("appointments.selectDoctor")}
              value={bookingForm.doctor}
              onChange={(e) => handleBookingChange("doctor", e.target.value)}
              sx={{ mb: 2 }}
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={t("appointments.selectDate")}
                  value={
                    bookingForm.date
                      ? bookingForm.date.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleBookingChange("date", new Date(e.target.value))
                  }
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split("T")[0] }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label={t("appointments.selectTime")}
                  value={
                    bookingForm.time
                      ? bookingForm.time.toISOString().substr(11, 5)
                      : ""
                  }
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":");
                    const time = new Date();
                    time.setHours(hours, minutes, 0, 0);
                    handleBookingChange("time", time);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              select
              label={t("appointments.appointmentType")}
              value={bookingForm.type}
              onChange={(e) => handleBookingChange("type", e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="consultation">
                {t("appointments.consultation")}
              </MenuItem>
              <MenuItem value="followup">{t("appointments.followup")}</MenuItem>
              <MenuItem value="emergency">
                {t("appointments.emergency")}
              </MenuItem>
            </TextField>

            <TextField
              fullWidth
              label={t("appointments.reason")}
              multiline
              rows={2}
              value={bookingForm.reason}
              onChange={(e) => handleBookingChange("reason", e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label={t("appointments.symptoms")}
              multiline
              rows={3}
              value={bookingForm.symptoms}
              onChange={(e) => handleBookingChange("symptoms", e.target.value)}
              placeholder={t("appointments.symptomsPlaceholder")}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBooking(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleBookAppointment}
            variant="contained"
            disabled={!bookingForm.doctor || !bookingForm.date}
          >
            {t("appointments.bookAppointment")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => setOpenBooking(true)}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default AppointmentsPage;
