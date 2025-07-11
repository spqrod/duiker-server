const nodemailer = require("nodemailer");
const { logger } = require("./logger");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    dkim: {
        domainName: "duikertravels.com",
        keySelector: "k1",
        privateKey: process.env.DKIM_PRIVATE_KEY,
    },
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
});

transporter.verify(function (error, success) {
    if (error) {
        logger.info('Verification Error:', {
            message: error.message,
            code: error.code,
            response: error.response, // SMTP server response
            stack: error.stack // Full stack trace
        });
    } else {
        logger.info("Connected to mail server");
    }
});

// Add event listeners for more detailed errors
transporter.on('error', (error) => {
    logger.info('Transport Error:', {
        message: error.message,
        code: error.code,
        response: error.response,
        stack: error.stack
    });
});

transporter.on('log', (log) => {
    logger.info('SMTP Log:', log); // Logs all SMTP interactions
});

exports.transporter = transporter;