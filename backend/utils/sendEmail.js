const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"DoubtMap" <${process.env.BREVO_USER}>`,
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