const nodemailer = require("nodemailer");

const hasEmailCredentials = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = hasEmailCredentials
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

if (transporter) {
  transporter.verify((error) => {
    if (error) {
      console.warn("⚠️ Email config notice:", error.message);
    } else {
      console.log("✅ Email server ready");
    }
  });
} else {
  console.log("ℹ️ Email service idle (EMAIL_USER / EMAIL_PASS not set)");
}

// Send email function
const sendEmail = async (to, subject, text) => {
  if (!transporter) {
    console.warn("Skipping email send: EMAIL_USER and EMAIL_PASS are not configured.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"SprintForge" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("📧 Email sent to:", to);
  } catch (error) {
    console.error("Email error:", error.message);
  }
};

module.exports = { sendEmail };