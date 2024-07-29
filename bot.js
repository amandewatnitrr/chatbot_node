const restify = require('restify');
const { BotFrameworkAdapter, MessageFactory } = require('botbuilder');
const fs = require('fs');
const nodemailer = require('nodemailer');
const corsMiddleware = require('restify-cors-middleware2');

// Load environment variables from .env file
require('dotenv').config();

// Create bot adapter, which defines how the bot sends and receives messages.
var adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Load FAQs from JSON file
let faqs;
fs.readFile('faqs.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading FAQs file:', err);
        return;
    }
    faqs = JSON.parse(data).faqs;
});

// Create HTTP server.
let server = restify.createServer();

// Configure CORS
const cors = corsMiddleware({
    origins: ['*'],
    allowHeaders: ['Authorization'],
    exposeHeaders: ['Authorization']
});

server.pre(cors.preflight);
server.use(cors.actual);

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
});

let userInfo = {};

// Listen for incoming requests at /api/messages.
server.post('/api/messages', async (req, res) => {
    // Use the adapter to process the incoming web request into a TurnContext object.
    await adapter.processActivity(req, res, async (turnContext) => {
        // Do something with this incoming activity!
        if (turnContext.activity.type === 'message') {
            const userId = turnContext.activity.from.id;

            if (!userInfo[userId]) {
                userInfo[userId] = {};
            }

            if (!userInfo[userId].ssoId) {
                userInfo[userId].ssoId = turnContext.activity.text;
                await turnContext.sendActivity('Please enter your modality name:');
                console.log(`SSO ID received: ${userInfo[userId].ssoId}`);
            } else if (!userInfo[userId].modality) {
                userInfo[userId].modality = turnContext.activity.text;
                await sendWelcomeMessage(turnContext);
                console.log(`Modality received: ${userInfo[userId].modality}`);
            } else {
                // Get the user's text
                const utterance = turnContext.activity.text;
                console.log(`User query received: ${utterance}`);

                // Find the corresponding answer from the FAQs
                const faq = faqs.find(faq => faq.question.toLowerCase() === utterance.toLowerCase());

                // Send the appropriate response
                if (faq) {
                    await turnContext.sendActivity(faq.answer);
                    console.log(`FAQ found: ${faq.answer}`);
                } else {
                    await turnContext.sendActivity('I am sorry, I do not have an answer for that question.');
                    console.log('FAQ not found, logging new query.');

                    // Send email with the new query
                    sendNewQueryEmail(userInfo[userId].ssoId, utterance);
                    
                    // Notify user that their query has been logged
                    await turnContext.sendActivity('Your query has been logged and will be reviewed by the team.');
                }

                // Send clickable options after the response
                await sendClickableOptions(turnContext);
            }
        } else if (turnContext.activity.type === 'conversationUpdate' && turnContext.activity.membersAdded) {
            for (let idx in turnContext.activity.membersAdded) {
                if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                    await turnContext.sendActivity('Welcome! Please enter your SSO ID:');
                }
            }
        }
    });
});

async function sendWelcomeMessage(turnContext) {
    await turnContext.sendActivity('Welcome! Here are some questions you can ask:');
    await sendClickableOptions(turnContext);
}

async function sendClickableOptions(turnContext) {
    const cardActions = faqs.map(faq => ({
        type: 'imBack',
        title: faq.question,
        value: faq.question
    }));

    const message = MessageFactory.suggestedActions(cardActions);
    await turnContext.sendActivity(message);
    console.log('Clickable options sent.');
}

function sendNewQueryEmail(ssoId, query) {
    // Configure the email transport using the default SMTP transport and an Outlook account.
    // For the email account, it's recommended to use environment variables to store sensitive information.
    let transporter = nodemailer.createTransport({
        service: 'Outlook365',
        auth: {
            user: process.env.OUTLOOK_USER,
            pass: process.env.OUTLOOK_PASS
        }
    });

    // Email options
    let mailOptions = {
        from: process.env.OUTLOOK_USER,
        to: 'aman.dewangan@gehealthcare.com',
        subject: 'New Query Logged',
        text: `Query from SSO ID: ${ssoId}\n\n${query}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error('Error sending email:', error);
        }
        console.log('Email sent:', info.response);
    });
}