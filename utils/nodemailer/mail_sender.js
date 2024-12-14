const nodemailer = require("nodemailer");
const fs=require("fs")
const path=require("path")

const generate_mail_token=require("../jwt/mail/generate_mail_token")

async function sendEmail(recieverEmail,payload,user) {

  const mailToken=await generate_mail_token(
    payload,
    "5m"
  )

  const mailUrl=`${process.env.SERVER_ADDRESS}/mail_verify/${mailToken}`

  user.mail_verification_token=mailToken

  await user.save()

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass:  process.env.NODE_MAILER_PASSWORD, 
      },
    });

    const emailTemplate = fs.readFileSync(
      path.join(__dirname, "mail_template.html"),
      "utf-8"
    );

    const emailTemplateCustom=emailTemplate
      .replace("{{url}}",mailUrl)

    // Email options
    const mailOptions = {
      from: process.env.NODE_MAILER_EMAIL,
      to: recieverEmail, 
      subject: "Account verification",
      text: `Hello this is mail from chat app!`,
      html: emailTemplateCustom,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: " + info.response);

    return 
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports=sendEmail