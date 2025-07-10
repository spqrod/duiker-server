const nodemailer = require("nodemailer");
const { logger } = require("./logger");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
    // debug: true, // Enables basic debug output
    // logger: true, // Enables detailed logging to console
    // transactionLog: true // Logs transaction details (e.g., SMTP commands)
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