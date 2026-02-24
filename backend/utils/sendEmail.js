const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // mailtrap credentials stored in .env
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  });


  const mailOptions = {
    from: '"Felicity Event Platform" <noreply@felicity.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  console.log("Attempting to connect to Mailtrap with host:", process.env.MAILTRAP_HOST);
  //send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;