const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, FROM_EMAIL } = process.env;

const { readFileSync } = require('fs');
const { join } = require('path');

const { createTransport } = require('nodemailer');
const { compile } = require('handlebars');

const transporter = createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
    },
});

/**
 * Sends emails to recipients using the parameters and created transport.
 */
async function sendEmail({ email, subject, payload, templateFileDirectory }) {
    try {
        const source = readFileSync(join(__dirname, templateFileDirectory), 'utf8');
        const compiledTemplate = compile(source);
        const options = () => ({
            from: FROM_EMAIL,
            to: email,
            subject,
            html: compiledTemplate(payload),
        });

        return await transporter.sendMail(options());
    } catch (error) {
        return error;
    }
}

global.sendEmail = sendEmail;
