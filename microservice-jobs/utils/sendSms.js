import twilio from "twilio";
import IndividualJobModel from "../models/IndividualJobs.js";
import OrganisationJobModel from "../models/OrganisationJobs.js";

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

//configuring connection to send SMS from given phone number to inputed data -> returns a delivery status report 
async function sendSms(msgData, taskId, usertype){
    try{    
        let model = usertype == "individual" ? IndividualJobModel : OrganisationJobModel;
        let messageStatus = await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            body: msgData.message,
            to: msgData.mobile
        })
        if(messageStatus.sid){
            await model.findOneAndUpdate({task : taskId, notificationtype : "sms"}, {jobstatus : true});
            // console.log(messageStatus.sid);
        }
    }catch(error){
        fs.appendFileSync("./logs/error-logs.txt", `sendSms-error ${new Date()} : ${JSON.stringify(error.message)}\n`);    
    }
}

export default sendSms