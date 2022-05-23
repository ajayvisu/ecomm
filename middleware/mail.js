const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const {join} = require('path')

require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_MAIL_APIKEY)


async function mailsending(maildata){
    try{
        console.log('success')

        let data = await ejs.renderFile(join(__dirname,'../templates',maildata.fileName),maildata,maildata.details)

        const mailDetails = {
            from : maildata.from,
            to : maildata.to,
            subject : maildata.subject,
            html : data
        }

        sgMail.send(mailDetails,(err,data)=>{
            if(data){
                console.log("mail sended");
            }else{
                console.log("mail failed")
            }
        })
    }catch(err){
        console.log(err.message)
    }
}



module.exports = {mailsending}