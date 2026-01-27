const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Port 465 sathi true
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Yithe App Password asava
    },
  });

  const mailOptions = {
    from: `"Nashikcha Khabarnama" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
