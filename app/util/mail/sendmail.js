let ejs = require('ejs');
const { nodemailersend } = require('./index');

export const sendEmail = function ({ to, subject, text, template, messageBody }) {
    console.log('template :', template);
    let path = __base + `/templates/email/${template}.ejs`;
    ejs.renderFile(path, { messageBody }, (error, result) => {
        console.log('error :', error);
        let mailOptions = {
            from: 'sumit@binarynumbers.io',
            to: to || 'logsumit28@gmail.com', // list of receivers
            subject: subject || 'Hello ✔', // Subject line
            text: text || 'Hello world?', // plain text body
            html: result // html body
        }
        nodemailersend(mailOptions);
    });
}