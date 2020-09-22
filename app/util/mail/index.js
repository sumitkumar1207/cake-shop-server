const nodemailer = require('nodemailer');
let { mailDetails } = require('@/app/config/keys')

export const nodemailersend = async (mailOptions) => {
    console.log("Entered nodemailersend utility");
    const transporter = nodemailer.createTransport(mailDetails);

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log('Message sending failed', error);
        } else console.log('Message sent: ', info.messageId);
    });
};

