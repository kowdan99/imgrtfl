const express = require('express');

require('dotenv').config({ path: "./.env" });
const twilio = require('twilio');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis').default // Redis session store
const redis = require('redis');
const crypto = require('crypto');

// Redis client
const redisClient = redis.createClient({
  host: 'localhost', // Redis server host (assuming Redis container is running locally)
  port: 6379, // Redis server port
  // Add any other configuration options here if needed
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function connectToRedis() {
  try {
      await redisClient.connect();
      console.log('Connected to Redis');
      // Other operations with Redis here
  } catch (error) {
      console.error('Error connecting to Redis:', error);
  }
}

connectToRedis();

// redisClient.ping((err, reply) => {
//   if (err) {
//     console.error('Error connecting to Redis:', err);
//   } else {
//     console.log('Connected to Redis:', reply); // Should print 'PONG'
//   }

//   // Close Redis client connection
//   redisClient.quit();
// });

const app = express()
app.use(cors());
const secretKey = crypto.randomBytes(32).toString('hex');


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: secretKey,
  resave: false,          // Set to false to prevent session data being resaved to store unnecessarily
  saveUninitialized: false,  // Set to false to prevent uninitialized sessions from being saved
  cookie: {
    secure: false // Set to true if using HTTPS
    // maxAge: 24 * 60 * 60 * 1000 // Session expiration in milliseconds (optional)
  }
}));
//app.use(bodyParser.urlencoded({ extended: true }));



const process = require('process');
const port = 3001

const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;
const verifySID = process.env.REACT_VERIFY_SERVICE_SID;

const client = new twilio(accountSid, authToken);


app.post('/api/sendOTP', async (req, res) => {
  const {inputValue} = req.body;
  // console.log(typeof inputValue)
  // console.log("REQUEST", inputValue)
  try {
      const otp = generateOTP(); // Implement your OTP generation logic
      req.session.otp = otp;
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
});

app.post('/verifyOTP', (req, res) => {
  console.log(req.session)
  const {otp} = req.body;
  console.log(otp);
  const expectedOTP = req.session.otp; // Assuming OTP is stored in session
  console.log(expectedOTP);
  // Compare user input with the expected OTP
  if (otp === expectedOTP) {
    // OTP verified successfully
    res.send({ success: true });
    //res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    // Invalid OTP
    res.status(400).json({ message: 'Invalid OTP' });
  }
});


app.listen(port, () => {
  console.log(`imgrtfl app listening on port ${port}`)
})

// Function to generate OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}