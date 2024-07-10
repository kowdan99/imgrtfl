const express = require('express');

require('dotenv').config({ path: "./.env" });
const bodyParser = require('body-parser');
const twilio = require('twilio');
const cors = require('cors');

const app = express()
app.use(cors());

//var jsonParser = bodyParser.json()
//app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
//app.use(bodyParser.urlencoded({ extended: true }));



const process = require('process');
const port = 3001

const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;
const verifySID = process.env.REACT_VERIFY_SERVICE_SID;

const client = new twilio(accountSid, authToken);


app.post('/api/sendOTP', async (req, res) => {
  const {inputValue} = req.body;
  console.log(typeof inputValue)
  console.log("REQUEST", inputValue)
  try {
      const otp = generateOTP(); // Implement your OTP generation logic
      const message = await client.messages.create({
          body: `[im grtfl] Your OTP is: ${otp}`,
          from: '+18557790407',
          to: inputValue
      });
      console.log('OTP sent successfully:', message.sid);
      res.send({ success: true });
  } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).send({ success: false, error: 'Failed to send OTP' });
  }
    res.send("Success!")
});

app.get('/verify', (req, res) => {


  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`imgrtfl app listening on port ${port}`)
})

// Function to generate OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}