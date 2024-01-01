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
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-radius: 10px;">
                <h3 style="color: #333;">Dear ${name},</h3>
                <p style="color: #555; font-size: 16px;">Thank you for choosing Thrift Kicks. Your OTP for email verification is: </p>
                
                <div style="margin: 20px 0; background-color: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <p style="margin: 0; font-size: 18px; color: #333;">OTP: <span id="otpDisplay" style="font-weight: bold;">${otp}</span></p>
                </div>

                <p style="color: #555; font-size: 16px;">Please use this code to complete the verification process.</p>
                <p style="color: #555; font-size: 16px;">Best Regards,<br/>The Thrift Kicks Team</p>
            </div>
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
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-radius: 10px;">
                <h3 style="color: #333;">Dear ${name},</h3>
                <p style="color: #555; font-size: 16px;">Thank you for choosing Thrift Kicks. Your OTP for resetting your password is: </p>
                
                <div style="margin: 20px 0; background-color: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <p style="margin: 0; font-size: 18px; color: #333;">OTP: <span id="otpDisplay" style="font-weight: bold;">${otp}</span></p>
                </div>

                <p style="color: #555; font-size: 16px;">Please use this code to change your password.</p>
                <p style="color: #555; font-size: 16px;">Best Regards,<br/>The Thrift Kicks Team</p>
            </div>
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