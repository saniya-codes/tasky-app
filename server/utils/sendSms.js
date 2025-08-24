import twilio from "twilio";

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

//configuring connection to send SMS from given phone number to inputed data -> returns a delivery status report 
async function sendSms(msgData, taskId){
    try{    
        let messageStatus = await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            body: msgData.message,
            to: msgData.mobile
        })
        // console.log(messageStatus.sid);
    }catch(error){
        console.log(error);
    }
}

export default sendSms