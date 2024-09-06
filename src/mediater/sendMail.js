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
    // const verificationUrl = `https://backend-crm-theta.vercel.app//verify-email?email=${encodeURIComponent(email)}&verificationToken=${verificationToken}`;
    const verificationUrl = `http://localhost:4000/verify-email?email=${encodeURIComponent(email)}&verificationToken=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification",
      html: `<h3>Hello ${name}</h3>
      <p>Click the link to verify your account</p>
      <a href="${verificationUrl}">Verify your email</a>`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${email}.`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

module.exports=sendVerificationEmail