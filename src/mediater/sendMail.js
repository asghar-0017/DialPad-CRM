const nodemailer = require("nodemailer");
const agentRepository = require('../repository/agentRepository');

const sendVerificationEmail = async (email, verificationToken, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification",
      html: `<h3>Hello ${name}</h3>
      <p>Click the link to verify your account</p>
      <a href="http://${process.env.POSTGRES_HOST}:${process.env.PORT}/verify-email?email=${encodeURIComponent(email)}&verificationToken=${verificationToken}">Verify your email</a>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${email}.`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

module.exports=sendVerificationEmail