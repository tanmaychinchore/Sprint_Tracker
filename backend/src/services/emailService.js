const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log("❌ Email config error:", error);
    } else {
        console.log("✅ Email server ready");
    }
});

// Send email function
const sendEmail = async (to, subject, text) => {
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