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

async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"DoubtMap" <${process.env.GMAIL_USER}>`,
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