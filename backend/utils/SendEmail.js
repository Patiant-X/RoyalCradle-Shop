import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const { EMAIL_PASS, EMAIL_SERVICE, EMAIL_USER } =
  process.env;

const SendEmail = async (res, email, token, userId, name) => {
  //create email transporter
  const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  var message = `<p>Dear ${name},</p><p>We have received a request to reset your password. 
  If you did not make this request, please ignore this email.</p>
  <p>To reset your password, please click on the following link:</p>
  <p><a href="https://royalcradle-shop.onrender.com/reset-password/${userId}/${token}/">
        Reset Password</a></p>
  <p>Thank you.</p>`;
  var mailOptions = {
    from: '5TygaEats <5tygaeats@gmail.com>',
    to: `${email}`,
    subject: 'Password Reset Request',
    html: message,
  };

  //send email
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
      res.status(400);
      throw new Error(err);
    } else {
      res.status(200).json('Please check your email');
    }
  });
};

export default SendEmail;
