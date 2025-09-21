import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormControl,
  FormLabel,
  FormGroup,
} from "@mui/material";
import {
  Psychology,
  ExpandMore,
  Warning,
  CheckCircle,
  Info,
  LocalHospital,
  Phone,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import symptomCheckerAPI from "../services/api/symptomChecker";

const SymptomCheckerPage = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [patientInfo, setPatientInfo] = useState({
    age: "",
    gender: "",
    temperature: "",
    bloodPressure: "",
    medicalHistory: [],
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);

  const steps = [
    t("symptomChecker.basicInfo"),
    t("symptomChecker.selectSymptoms"),
    t("symptomChecker.additionalInfo"),
    t("symptomChecker.results"),
  ];

  const commonSymptoms = [
    { id: "fever", name: t("symptoms.fever"), category: "general" },
    { id: "cough", name: t("symptoms.cough"), category: "respiratory" },
    { id: "headache", name: t("symptoms.headache"), category: "neurological" },
    {
      id: "sore_throat",
      name: t("symptoms.soreThroat"),
      category: "respiratory",
    },
    { id: "body_ache", name: t("symptoms.bodyAche"), category: "general" },
    { id: "nausea", name: t("symptoms.nausea"), category: "digestive" },
    {
      id: "dizziness",
      name: t("symptoms.dizziness"),
      category: "neurological",
    },
    { id: "chest_pain", name: t("symptoms.chestPain"), category: "cardiac" },
    {
      id: "shortness_breath",
      name: t("symptoms.shortnessBreath"),
      category: "respiratory",
    },
    {
      id: "stomach_pain",
      name: t("symptoms.stomachPain"),
      category: "digestive",
    },
    { id: "diarrhea", name: t("symptoms.diarrhea"), category: "digestive" },
    { id: "vomiting", name: t("symptoms.vomiting"), category: "digestive" },
    { id: "fatigue", name: t("symptoms.fatigue"), category: "general" },
    {
      id: "skin_rash",
      name: t("symptoms.skinRash"),
      category: "dermatological",
    },
    {
      id: "joint_pain",
      name: t("symptoms.jointPain"),
      category: "musculoskeletal",
    },
  ];

  const emergencySymptoms = [
    "chest_pain",
    "shortness_breath",
    "severe_headache",
    "loss_consciousness",
    "severe_bleeding",
    "high_fever",
    "difficulty_speaking",
  ];

  const medicalConditions = [
    "diabetes",
    "hypertension",
    "heart_disease",
    "asthma",
    "kidney_disease",
    "liver_disease",
    "arthritis",
    "depression",
  ];

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    try {
      const response = await symptomCheckerAPI.getSymptoms();
      setSymptoms(response.data.symptoms || commonSymptoms);
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      setSymptoms(commonSymptoms);
    }
  };

  const handleSymptomToggle = (symptomId) => {
    const isSelected = selectedSymptoms.includes(symptomId);
    let newSelectedSymptoms;

    if (isSelected) {
      newSelectedSymptoms = selectedSymptoms.filter((id) => id !== symptomId);
    } else {
      newSelectedSymptoms = [...selectedSymptoms, symptomId];
    }

    setSelectedSymptoms(newSelectedSymptoms);

    // Check for emergency symptoms
    const hasEmergencySymptom = newSelectedSymptoms.some((id) =>
      emergencySymptoms.includes(id)
    );

    if (hasEmergencySymptom && !showEmergencyDialog) {
      setShowEmergencyDialog(true);
    }
  };

  const handlePatientInfoChange = (field, value) => {
    setPatientInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMedicalHistoryChange = (condition) => {
    const isSelected = patientInfo.medicalHistory.includes(condition);
    let newHistory;

    if (isSelected) {
      newHistory = patientInfo.medicalHistory.filter(
        (item) => item !== condition
      );
    } else {
      newHistory = [...patientInfo.medicalHistory, condition];
    }

    setPatientInfo((prev) => ({
      ...prev,
      medicalHistory: newHistory,
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnalyzeSymptoms = async () => {
    setLoading(true);
    try {
      const analysisData = {
        symptoms: selectedSymptoms,
        patientInfo,
      };

      const response = await symptomCheckerAPI.analyze(analysisData);
      setResults(response.data);
      setCurrentStep(3);
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      // Mock results for demonstration
      setResults({
        possibleConditions: [
          {
            name: t("conditions.commonCold"),
            probability: 75,
            description: t("conditions.commonColdDesc"),
            severity: "mild",
          },
          {
            name: t("conditions.flu"),
            probability: 60,
            description: t("conditions.fluDesc"),
            severity: "moderate",
          },
          {
            name: t("conditions.viral"),
            probability: 45,
            description: t("conditions.viralDesc"),
            severity: "mild",
          },
        ],
        recommendations: [
          t("recommendations.rest"),
          t("recommendations.fluids"),
          t("recommendations.fever_reducer"),
          t("recommendations.monitor_symptoms"),
        ],
        urgency: "low",
        followUp: t("recommendations.see_doctor_if_worse"),
      });
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "mild":
        return "success";
      case "moderate":
        return "warning";
      case "severe":
        return "error";
      default:
        return "info";
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case "high":
        return <Warning color="error" />;
      case "medium":
        return <Warning color="warning" />;
      default:
        return <Info color="info" />;
    }
  };

  const groupedSymptoms = symptoms.reduce((groups, symptom) => {
    const category = symptom.category || "other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(symptom);
    return groups;
  }, {});

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t("symptomChecker.basicInfoDesc")}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("symptomChecker.age")}
                  type="number"
                  value={patientInfo.age}
                  onChange={(e) =>
                    handlePatientInfoChange("age", e.target.value)
                  }
                  inputProps={{ min: 0, max: 120 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    {t("symptomChecker.gender")}
                  </FormLabel>
                  <RadioGroup
                    value={patientInfo.gender}
                    onChange={(e) =>
                      handlePatientInfoChange("gender", e.target.value)
                    }
                    row
                  >
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label={t("gender.male")}
                    />
                    <FormControlLabel
                      value="female"
                      control={<Radio />}
                      label={t("gender.female")}
                    />
                    <FormControlLabel
                      value="other"
                      control={<Radio />}
                      label={t("gender.other")}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("symptomChecker.temperature")}
                  value={patientInfo.temperature}
                  onChange={(e) =>
                    handlePatientInfoChange("temperature", e.target.value)
                  }
                  placeholder="98.6°F or 37°C"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("symptomChecker.bloodPressure")}
                  value={patientInfo.bloodPressure}
                  onChange={(e) =>
                    handlePatientInfoChange("bloodPressure", e.target.value)
                  }
                  placeholder="120/80"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t("symptomChecker.selectSymptomsDesc")}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {t("symptomChecker.selectMultiple")}
            </Typography>

            {Object.entries(groupedSymptoms).map(
              ([category, categorySymptoms]) => (
                <Accordion key={category} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography
                      variant="subtitle1"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {t(`symptomCategories.${category}`)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup>
                      {categorySymptoms.map((symptom) => (
                        <FormControlLabel
                          key={symptom.id}
                          control={
                            <Checkbox
                              checked={selectedSymptoms.includes(symptom.id)}
                              onChange={() => handleSymptomToggle(symptom.id)}
                            />
                          }
                          label={symptom.name}
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              )
            )}

            {selectedSymptoms.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("symptomChecker.selectedSymptoms")}:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedSymptoms.map((symptomId) => {
                    const symptom = symptoms.find((s) => s.id === symptomId);
                    return (
                      <Chip
                        key={symptomId}
                        label={symptom?.name || symptomId}
                        onDelete={() => handleSymptomToggle(symptomId)}
                        color="primary"
                        variant="outlined"
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t("symptomChecker.additionalInfoDesc")}
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              {t("symptomChecker.medicalHistory")}:
            </Typography>
            <FormGroup>
              {medicalConditions.map((condition) => (
                <FormControlLabel
                  key={condition}
                  control={
                    <Checkbox
                      checked={patientInfo.medicalHistory.includes(condition)}
                      onChange={() => handleMedicalHistoryChange(condition)}
                    />
                  }
                  label={t(`conditions.${condition}`)}
                />
              ))}
            </FormGroup>
          </Box>
        );

      case 3:
        return (
          <Box>
            {results && (
              <>
                <Box display="flex" alignItems="center" mb={2}>
                  {getUrgencyIcon(results.urgency)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {t("symptomChecker.analysisResults")}
                  </Typography>
                </Box>

                {results.urgency === "high" && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {t("symptomChecker.seekImmediateMedicalAttention")}
                  </Alert>
                )}

                <Typography variant="subtitle1" gutterBottom>
                  {t("symptomChecker.possibleConditions")}:
                </Typography>
                {results.possibleConditions.map((condition, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="h6">{condition.name}</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={`${condition.probability}%`}
                            color="primary"
                            size="small"
                          />
                          <Chip
                            label={condition.severity}
                            color={getSeverityColor(condition.severity)}
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {condition.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  {t("symptomChecker.recommendations")}:
                </Typography>
                <List>
                  {results.recommendations.map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>

                {results.followUp && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {results.followUp}
                  </Alert>
                )}

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<LocalHospital />}
                    onClick={() => (window.location.href = "/appointments")}
                    sx={{ mr: 2 }}
                  >
                    {t("symptomChecker.bookAppointment")}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Phone />}
                    onClick={() => window.open("tel:108")}
                  >
                    {t("symptomChecker.callEmergency")}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Psychology color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" component="h1">
            {t("symptomChecker.title")}
          </Typography>
        </Box>

        <Typography variant="body1" color="textSecondary" paragraph>
          {t("symptomChecker.description")}
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          {t("symptomChecker.disclaimer")}
        </Alert>

        <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(currentStep)}

        <Box sx={{ display: "flex", flexDirection: "row", pt: 2, mt: 4 }}>
          <Button
            color="inherit"
            disabled={currentStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            {t("common.back")}
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          {currentStep === steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(0)}>
              {t("symptomChecker.startOver")}
            </Button>
          ) : currentStep === steps.length - 2 ? (
            <Button
              variant="contained"
              onClick={handleAnalyzeSymptoms}
              disabled={loading || selectedSymptoms.length === 0}
            >
              {loading
                ? t("common.loading")
                : t("symptomChecker.analyzeSymptoms")}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              {t("common.next")}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Emergency Dialog */}
      <Dialog
        open={showEmergencyDialog}
        onClose={() => setShowEmergencyDialog(false)}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Warning color="error" sx={{ mr: 1 }} />
            {t("symptomChecker.emergencyWarning")}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>{t("symptomChecker.emergencyMessage")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEmergencyDialog(false)}>
            {t("common.continue")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => window.open("tel:108")}
          >
            {t("symptomChecker.callNow")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SymptomCheckerPage;
