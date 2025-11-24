const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.GMAIL_HOST,
    port: process.env.SECURE_PORT, // if secure false, port= 587
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define email options
  const mailOpts = {
    from: 'E_Commerce App <mail>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
