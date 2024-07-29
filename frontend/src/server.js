const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: 'amandewatnitrr@outlook.com',
    pass: 'nitfox9210'
  }
});

app.post('/send-email', (req, res) => {
  const { ssoid, modality, query } = req.body;

  const mailOptions = {
    from: 'amandewatnitrr@outlook.com',
    to: '223072287@gehealthcare.com',
    subject: 'Custom Query from Chatbot',
    text: `SSO ID: ${ssoid}\nModality: ${modality}\nQuery: ${query}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send('Email sent: ' + info.response);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});