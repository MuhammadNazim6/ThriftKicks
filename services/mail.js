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
    from:'nazimnazz66@gmail.com',
    to: toMail,
    subject:`Hi, ${name} Your OTP for email verification for Thrift Kicks is: ${otp} `,

    
  }

  try {
    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Sending Email failed with error:",error);
  }
}



module.exports = {
  sendMail
}