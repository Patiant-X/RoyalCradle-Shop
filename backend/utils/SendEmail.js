import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const { EMAIL_PASS, EMAIL_SERVICE, EMAIL_USER } = process.env;

const SendEmail = async (res, email, message, subject, state) => {
  //create email transporter
  const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  var mailOptions = {
    from: 'RoyalEats <5tygaeats@gmail.com>',
    to: `${email}`,
    subject: `${subject}`,
    html: `${message}`,
  };

  //send email
  await transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      if (state) {
        return
      } else {
        res.status(400);
        throw new Error(err);
      }
    } else { 
      if (state) {
        return 
      }
      res.status(200).json('Please check your email');
    }
  });
};

export default SendEmail;
