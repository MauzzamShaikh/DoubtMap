const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

transporter.verify(function (error, success) {
    if (error) {
        console.error("SMTP Verify Error:", error);
    } else {
        console.log("SMTP Ready");
    }
});

async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Classroom Doubt Heatmap" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
  } catch (err) {
    console.error('Email send failed:', err);
    throw err;
  }
}

module.exports = sendEmail;