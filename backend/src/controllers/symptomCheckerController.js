// Symptom checker data structure for rural healthcare
const symptomCategories = {
  fever: {
    name: "Fever/बुखार/ਬੁਖਾਰ",
    symptoms: [
      { name: "High fever (>101°F)", severity: "high", points: 3 },
      { name: "Mild fever", severity: "medium", points: 2 },
      { name: "Chills", severity: "medium", points: 2 },
      { name: "Body aches", severity: "low", points: 1 },
      { name: "Headache", severity: "medium", points: 2 },
    ],
  },
  respiratory: {
    name: "Breathing Problems/सांस की समस्या/ਸਾਹ ਦੀ ਸਮੱਸਿਆ",
    symptoms: [
      { name: "Difficulty breathing", severity: "high", points: 4 },
      { name: "Persistent cough", severity: "medium", points: 2 },
      { name: "Chest pain", severity: "high", points: 3 },
      { name: "Sore throat", severity: "low", points: 1 },
      { name: "Runny nose", severity: "low", points: 1 },
    ],
  },
  gastrointestinal: {
    name: "Stomach Problems/पेट की समस्या/ਪੇਟ ਦੀ ਸਮੱਸਿਆ",
    symptoms: [
      { name: "Severe abdominal pain", severity: "high", points: 4 },
      { name: "Vomiting", severity: "medium", points: 2 },
      { name: "Diarrhea", severity: "medium", points: 2 },
      { name: "Nausea", severity: "low", points: 1 },
      { name: "Loss of appetite", severity: "low", points: 1 },
    ],
  },
  skin: {
    name: "Skin Problems/त्वचा की समस्या/ਚਮੜੀ ਦੀ ਸਮੱਸਿਆ",
    symptoms: [
      { name: "Severe rash", severity: "medium", points: 2 },
      { name: "Itching", severity: "low", points: 1 },
      { name: "Skin discoloration", severity: "medium", points: 2 },
      { name: "Wounds not healing", severity: "high", points: 3 },
      { name: "Swelling", severity: "medium", points: 2 },
    ],
  },
  neurological: {
    name: "Head/Brain Problems/सिर/दिमाग की समस्या/ਸਿਰ/ਦਿਮਾਗ ਦੀ ਸਮੱਸਿਆ",
    symptoms: [
      { name: "Severe headache", severity: "high", points: 3 },
      { name: "Dizziness", severity: "medium", points: 2 },
      { name: "Confusion", severity: "high", points: 4 },
      { name: "Vision problems", severity: "high", points: 3 },
      { name: "Memory issues", severity: "medium", points: 2 },
    ],
  },
};

const commonConditions = {
  cold: {
    name: "Common Cold/सामान्य सर्दी/ਆਮ ਜ਼ੁਕਾਮ",
    symptoms: ["runny nose", "sore throat", "mild fever", "body aches"],
    advice: "Rest, drink fluids, take paracetamol for fever",
    urgency: "low",
    selfCare: true,
  },
  fever: {
    name: "Fever/बुखार/ਬੁਖਾਰ",
    symptoms: ["high fever", "chills", "body aches"],
    advice:
      "Take paracetamol, drink fluids, rest. Consult doctor if fever persists",
    urgency: "medium",
    selfCare: false,
  },
  gastritis: {
    name: "Stomach Problem/गैस्ट्राइटिस/ਪੇਟ ਦੀ ਸਮੱਸਿਆ",
    symptoms: ["abdominal pain", "nausea", "loss of appetite"],
    advice: "Avoid spicy foods, eat small meals, drink water",
    urgency: "medium",
    selfCare: true,
  },
  hypertension: {
    name: "High Blood Pressure/उच्च रक्तचाप/ਹਾਈ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ",
    symptoms: ["headache", "dizziness", "chest pain"],
    advice: "Check blood pressure, reduce salt, exercise regularly",
    urgency: "high",
    selfCare: false,
  },
};

const healthTips = {
  general: [
    {
      title: "Stay Hydrated/हाइड्रेटेड रहें/ਪਾਣੀ ਪੀਓ",
      description: "Drink at least 8 glasses of clean water daily",
      category: "general",
    },
    {
      title: "Wash Hands/हाथ धोएं/ਹੱਥ ਧੋਵੋ",
      description: "Wash hands frequently with soap for 20 seconds",
      category: "hygiene",
    },
    {
      title: "Balanced Diet/संतुलित आहार/ਸੰਤੁਲਿਤ ਖੁਰਾਕ",
      description: "Include fruits, vegetables, and whole grains in your diet",
      category: "nutrition",
    },
  ],
  seasonal: [
    {
      title: "Monsoon Care/बरसात की देखभाल/ਮਾਨਸੂਨ ਦੇਖਭਾਲ",
      description: "Avoid stagnant water, use mosquito nets",
      category: "seasonal",
    },
  ],
};

// @desc    Check symptoms and provide recommendations
// @route   POST /api/symptom-checker/check
// @access  Public
const checkSymptoms = async (req, res, next) => {
  try {
    const { symptoms, age, gender, duration } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide symptoms to check",
      });
    }

    // Calculate severity score
    let totalScore = 0;
    let matchedSymptoms = [];
    let categories = {};

    symptoms.forEach((symptom) => {
      Object.keys(symptomCategories).forEach((categoryKey) => {
        const category = symptomCategories[categoryKey];
        const matchedSymptom = category.symptoms.find(
          (s) =>
            s.name.toLowerCase().includes(symptom.toLowerCase()) ||
            symptom.toLowerCase().includes(s.name.toLowerCase())
        );

        if (matchedSymptom) {
          totalScore += matchedSymptom.points;
          matchedSymptoms.push({
            symptom: matchedSymptom.name,
            category: category.name,
            severity: matchedSymptom.severity,
            points: matchedSymptom.points,
          });

          if (!categories[categoryKey]) {
            categories[categoryKey] = 0;
          }
          categories[categoryKey] += matchedSymptom.points;
        }
      });
    });

    // Determine urgency based on score
    let urgency = "low";
    let recommendation = "";
    let needsDoctor = false;

    if (totalScore >= 8) {
      urgency = "emergency";
      recommendation =
        "Seek immediate medical attention. Go to nearest hospital or call emergency services.";
      needsDoctor = true;
    } else if (totalScore >= 5) {
      urgency = "high";
      recommendation =
        "Consult a doctor soon. Book an appointment for today or tomorrow.";
      needsDoctor = true;
    } else if (totalScore >= 3) {
      urgency = "medium";
      recommendation =
        "Monitor symptoms and consider consulting a doctor if they persist or worsen.";
      needsDoctor = false;
    } else {
      urgency = "low";
      recommendation =
        "Try home remedies and self-care. Consult doctor if symptoms persist for more than 3 days.";
      needsDoctor = false;
    }

    // Find possible conditions
    const possibleConditions = [];
    Object.keys(commonConditions).forEach((conditionKey) => {
      const condition = commonConditions[conditionKey];
      const symptomMatch = symptoms.some((userSymptom) =>
        condition.symptoms.some(
          (conditionSymptom) =>
            userSymptom
              .toLowerCase()
              .includes(conditionSymptom.toLowerCase()) ||
            conditionSymptom.toLowerCase().includes(userSymptom.toLowerCase())
        )
      );

      if (symptomMatch) {
        possibleConditions.push({
          name: condition.name,
          advice: condition.advice,
          urgency: condition.urgency,
          selfCare: condition.selfCare,
        });
      }
    });

    // Age and gender specific advice
    let additionalAdvice = [];

    if (age && age > 60) {
      additionalAdvice.push(
        "As a senior citizen, please monitor symptoms closely and consult doctor early."
      );
    }

    if (age && age < 12) {
      additionalAdvice.push(
        "For children, consult a pediatrician for proper evaluation."
      );
    }

    // Duration-based advice
    if (duration && duration > 7) {
      additionalAdvice.push(
        "Since symptoms have persisted for over a week, medical consultation is recommended."
      );
      needsDoctor = true;
    }

    res.status(200).json({
      success: true,
      data: {
        totalScore,
        urgency,
        needsDoctor,
        recommendation,
        matchedSymptoms,
        categories,
        possibleConditions: possibleConditions.slice(0, 3), // Top 3 matches
        additionalAdvice,
        disclaimer:
          "This is not a medical diagnosis. Please consult a healthcare professional for proper medical advice.",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get symptom categories
// @route   GET /api/symptom-checker/categories
// @access  Public
const getSymptomCategories = (req, res) => {
  res.status(200).json({
    success: true,
    data: symptomCategories,
  });
};

// @desc    Get common symptoms for quick selection
// @route   GET /api/symptom-checker/common
// @access  Public
const getCommonSymptoms = (req, res) => {
  const commonSymptoms = [];

  Object.keys(symptomCategories).forEach((categoryKey) => {
    const category = symptomCategories[categoryKey];
    category.symptoms.forEach((symptom) => {
      commonSymptoms.push({
        name: symptom.name,
        category: category.name,
        severity: symptom.severity,
      });
    });
  });

  // Sort by severity and return top 20
  const sortedSymptoms = commonSymptoms
    .sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    })
    .slice(0, 20);

  res.status(200).json({
    success: true,
    data: sortedSymptoms,
  });
};

// @desc    Get health tips
// @route   GET /api/symptom-checker/health-tips
// @access  Public
const getHealthTips = (req, res) => {
  const { category } = req.query;
  let tips = [];

  if (category) {
    // Filter tips by category
    Object.keys(healthTips).forEach((tipCategory) => {
      if (tipCategory === category || category === "all") {
        tips = tips.concat(healthTips[tipCategory]);
      }
    });
  } else {
    // Return all tips
    Object.keys(healthTips).forEach((tipCategory) => {
      tips = tips.concat(healthTips[tipCategory]);
    });
  }

  res.status(200).json({
    success: true,
    data: tips,
  });
};

module.exports = {
  checkSymptoms,
  getSymptomCategories,
  getCommonSymptoms,
  getHealthTips,
};
