const express = require("express");
const app = express();
const port = 80;
const cors = require("cors");
const os = require("os");
const axios = require("axios");
require("dotenv").config();
const { transporter } = require("./email");
const { sanitizeString } = require("./sanitizeString");
const path = require('path');

// function getLocalIP() {
//     const interfaces = os.networkInterfaces();
//     for (let iface of Object.values(interfaces)) {
//       for (let alias of iface) {
//         if (alias.family === 'IPv4' && !alias.internal) {
//           return alias.address;
//         }
//       }
//     }
//     return 'No local IP found';
// }
  
// const localIP = getLocalIP();
// console.log(`Server running at http://${localIP}:${port}`);

const { logger } = require("./logger");

app.use(express.static("build"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    logger.info(`Received a ${req.method} request for ${req.url}`);
    next();
});

// POST contact email
app.post("/api/contact", async (req, res) => {

    const { token } = req.body;
    const secretKey = process.env.CAPTCHA_SECRET_KEY;

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
            {},
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (response.data.success && response.data.score >= 0.5) { // Adjustable threshold
            logger.info(`Captcha in /api/contact successful, score: ${response.data.score}`);

            let { name, email, phone, formMessage } = req.body;
            name = sanitizeString(name);
            email = sanitizeString(email);
            phone = sanitizeString(phone);
            formMessage = sanitizeString(formMessage);

            const emailBody = `<h2>New message from website</h2>
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Phone: ${phone}</p>
            <p>Message: ${formMessage}</p>`;

            const message = {
                from: process.env.EMAIL_FROM,
                to: process.env.EMAIL_TO,
                subject: "New message from website",
                html: emailBody
            };

            transporter.sendMail(message)
                .then(() => {
                    logger.info("Message sent successfully");
                    res.json({success: true});
                })
                .catch(() => {
                    logger.info("There was an error sending message");
                    res.json({success: false});
                });

        } else {
            logger.info(`CAPTCHA failed or low score: ${response.data.score}`);
            res.json({ success: false, res: 'reCAPTCHA verification failed' });
        } 
    }
    catch (error) {
        logger.info('CAPTCHA error', error);
        res.status(500).json({ success: false, res: 'Error verifying reCAPTCHA' });
    }
});

// POST reservation
app.post("/api/reservation", async (req, res) => {

    const { token } = req.body;
    const secretKey = process.env.CAPTCHA_SECRET_KEY;

    try {

        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
            {},
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (response.data.success && response.data.score >= 0.5) { // Adjustable threshold
            logger.info(`Captcha in /api/contact successful, score: ${response.data.score}`);

            let { name, email, phone, specialRequests, payment, serviceType, pickUpDate, pickUpTime, pickUpLocation, dropOffLocation } = req.body;
            name = sanitizeString(name);
            email = sanitizeString(email);
            phone = sanitizeString(phone);
            specialRequests = sanitizeString(specialRequests);
            payment = sanitizeString(payment);
            serviceType = sanitizeString(serviceType);
            pickUpDate = sanitizeString(pickUpDate);
            pickUpTime = sanitizeString(pickUpTime);
            pickUpLocation = sanitizeString(pickUpLocation);
            dropOffLocation = sanitizeString(dropOffLocation);

            const emailBody = `<h2>New reservation request from website</h2>
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Phone: ${phone}</p>
            <p>Payment: ${payment}</p>
            <p>Service Type: ${serviceType}</p>
            <p>Pick Up Date: ${pickUpDate}</p>
            <p>Pick Up Time: ${pickUpTime}</p>
            <p>Pick Up Location: ${pickUpLocation}</p>
            <p>Drop Off Location: ${dropOffLocation}</p>
            <p>Special Requests: ${specialRequests}</p>
            `;

            const message = {
                from: process.env.EMAIL_FROM,
                to: process.env.EMAIL_TO,
                subject: "New Reservation Request From Website",
                html: emailBody
            };

            transporter.sendMail(message)
                .then(() => {
                    logger.info("Reservation request sent successfully");
                    res.json({success: true});
                })
                .catch(() => {
                    logger.info("There was an error sending reservation request");
                    res.json({success: false});
                });
        } else {
            logger.info(`CAPTCHA failed or low score: ${response.data.score}`);
            res.json({ success: false, res: 'reCAPTCHA verification failed' });
        }
    } catch (error) {
        logger.info('CAPTCHA error', error);
        res.status(500).json({ success: false, res: 'Error verifying reCAPTCHA' });
    }
});

app.listen(port, () => logger.info("Listening to port " + port));