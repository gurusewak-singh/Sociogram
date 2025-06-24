const nodemailer = require('nodemailer');

// --- DEBUGGING LOGS ---
console.log('--- NODEMAILER CREDENTIALS ---');
console.log('HOST:', process.env.EMAIL_HOST);
console.log('USER:', process.env.EMAIL_USER);
console.log('PASS:', process.env.EMAIL_PASS);
console.log('------------------------------');
// --- END DEBUGGING LOGS ---

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;