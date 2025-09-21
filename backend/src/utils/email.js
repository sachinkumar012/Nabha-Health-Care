const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    // Production email configuration
    return nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Development - use ethereal email
    return nodemailer.createTransporter({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.pass",
      },
    });
  }
};

const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html:
        generateEmailTemplate(options.template, options.data) || options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);

    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

const generateEmailTemplate = (template, data) => {
  const templates = {
    appointmentRequest: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">New Appointment Request</h2>
        <p>Dear Dr. ${data.doctorName},</p>
        <p>You have received a new appointment request from <strong>${
          data.patientName
        }</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Appointment Details:</h3>
          <p><strong>Date:</strong> ${data.appointmentDate}</p>
          <p><strong>Time:</strong> ${data.appointmentTime}</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
          ${
            data.symptoms
              ? `<p><strong>Symptoms:</strong> ${data.symptoms}</p>`
              : ""
          }
        </div>
        
        <p>Please log in to your dashboard to review and confirm this appointment.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Dashboard
          </a>
        </div>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This email was sent from Nabha HealthCare. If you believe this was sent in error, please contact our support team.
        </p>
      </div>
    `,

    appointmentConfirmation: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4caf50;">Appointment Confirmed</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your appointment has been confirmed!</p>
        
        <div style="background-color: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Appointment Details:</h3>
          <p><strong>Doctor:</strong> Dr. ${data.doctorName}</p>
          <p><strong>Date:</strong> ${data.appointmentDate}</p>
          <p><strong>Time:</strong> ${data.appointmentTime}</p>
          <p><strong>Type:</strong> ${data.appointmentType}</p>
        </div>
        
        <p>Please arrive 15 minutes early for your appointment. If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/appointments" 
             style="background-color: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Appointments
          </a>
        </div>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This email was sent from Nabha HealthCare. For any questions, please contact us at ${process.env.SUPPORT_EMAIL}.
        </p>
      </div>
    `,

    passwordReset: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Password Reset Request</h2>
        <p>Dear ${data.name},</p>
        <p>You have requested to reset your password for your Nabha HealthCare account.</p>
        
        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
          <p><strong>Important:</strong> This link will expire in 10 minutes for security reasons.</p>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${data.resetUrl}" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This email was sent from Nabha HealthCare. If you're having trouble clicking the button above, copy and paste the URL below into your web browser: ${data.resetUrl}
        </p>
      </div>
    `,

    welcome: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Welcome to Nabha HealthCare!</h2>
        <p>Dear ${data.name},</p>
        <p>Welcome to Nabha HealthCare - your digital healthcare companion for rural Punjab!</p>
        
        <div style="background-color: #e3f2fd; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Get Started:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Complete your profile information</li>
            <li>Book your first appointment with our doctors</li>
            <li>Use our AI-powered symptom checker</li>
            <li>Find medicines at nearby pharmacies</li>
          </ul>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <p>If you have any questions, our support team is here to help you at ${process.env.SUPPORT_EMAIL}.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          Thank you for choosing Nabha HealthCare - bringing quality healthcare to rural Punjab.
        </p>
      </div>
    `,
  };

  return templates[template] || null;
};

module.exports = {
  sendEmail,
};
