const nodemailer = require("nodemailer");
const { logger } = require("./logger");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.verify(function (error, success) {
    if (error)
        logger.info(error);
    else    
        logger.info("Connected to mail server");
});

exports.transporter = transporter;