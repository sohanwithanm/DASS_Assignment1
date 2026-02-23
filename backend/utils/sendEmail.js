const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create the transporter using Mailtrap credentials
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  });


  // 2. Define the email options
  const mailOptions = {
    from: '"Felicity Event Platform" <noreply@felicity.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  console.log("Attempting to connect to Mailtrap with host:", process.env.MAILTRAP_HOST);
  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;