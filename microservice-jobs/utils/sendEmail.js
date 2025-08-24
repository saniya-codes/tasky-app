import nodemailer from "nodemailer"
import IndividualJobModel from "../models/IndividualJobs.js";
import OrganisationJobModel from "../models/OrganisationJobs.js";

async function sendEmail(emailData, taskId, usertype){ 
    try{
        //configuring SMTP client (nodemailr) with SMTP email server (brevo)
        let model = usertype == "individual" ? IndividualJobModel : OrganisationJobModel;
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST, 
            port: 587,
            secure: false, //465 if true
            auth: { //credentials for smtp server 
              user: process.env.SMTP_EMAIL, 
              pass: process.env.SMTP_KEY,
            }
          });

        //configuring SMTP server with recepient email servers 
        const info = await transporter.sendMail({
            from: `${process.env.SMTP_SENDER_NAME} <${process.env.SMTP_SENDER_EMAIL}>`,  
            to: `${emailData.to}`,
            subject: `${emailData.subject}`, 
            html: `${emailData.html}`
        });
        if(info.messageId){ 
            await model.findOneAndUpdate({task : taskId, notificationtype : "email"}, {jobstatus : true});
            // console.log(info.messageId);
        }
    }catch(error){
        fs.appendFileSync("./logs/error-logs.txt", `sendEmail-error ${new Date()} : ${JSON.stringify(error.message)}\n`);    
    }
}

export default sendEmail;