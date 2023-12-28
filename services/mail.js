const nodemailer = require('nodemailer')
// const { logout } = require('../controllers/adminController')


async function sendMail(toMail,otp,name){
 const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
      user:process.env.EMAIL,
      pass:process.env.PASS
    }
  })

  //mail content
  const mailOptions = {
    from: process.env.EMAIL,
    to: toMail,
    subject: 'OTP for Email Verification of Thrift Kicks',

    html: `
        <div class="email-container">
            <h3>Dear ${name},</h3>
            <p>Thank you for choosing Thrift Kicks. Your OTP for email verification is: <strong>${otp}</strong>. Please use this code to complete the verification process.</p>

            <p>Best Regards,<br/>The Thrift Kicks Team</p>
        </div>  
    `
};

  try {
    const result = await transporter.sendMail(mailOptions)

  } catch (error) {
    console.log("Sending Email failed with error:",error);
  }
}


async function sendForgotPassMail(toMail,otp,name){
  const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth:{
       user:process.env.EMAIL,
       pass:process.env.PASS
     }
   })
 
   //mail content
   const mailOptions = {
     from: process.env.EMAIL,
     to: toMail,
     subject: 'OTP for changing password of Thrift Kicks account',
 
     html: `
         <div class="email-container">
             <h3>Dear ${name},</h3>
             <p>Thank you for choosing Thrift Kicks. Your OTP for resetting your password is: <strong>${otp}</strong>. Please use this code to change your password.</p>
 
             <p>Best Regards,<br/>The Thrift Kicks Team</p>
         </div>  
     `
 };
 
   try {
     const result = await transporter.sendMail(mailOptions)
     console.log("Email sent successfully");
   } catch (error) {
     console.log("Sending Email failed with error:",error);
   }
 }
 



 async function orderPlacedMail(toMail,otp,name){
  const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth:{
       user:process.env.EMAIL,
       pass:process.env.PASS
     }
   })
 
   //mail content
   const mailOptions = {
     from: process.env.EMAIL,
     to: toMail,
     subject: 'OTP for changing password of Thrift Kicks account',
 
     html: `
         <div class="email-container">
             <h3>Dear ${name},</h3>
             <p>Thank you for choosing Thrift Kicks. Your OTP for resetting your password is: <strong>${otp}</strong>. Please use this code to change your password.</p>
 
             <p>Best Regards,<br/>The Thrift Kicks Team</p>
         </div>  
     `
 };
 
   try {
     const result = await transporter.sendMail(mailOptions)
     console.log("Email sent successfully");
   } catch (error) {
     console.log("Sending Email failed with error:",error);
   }
 }


module.exports = {
  sendMail,
  sendForgotPassMail
}