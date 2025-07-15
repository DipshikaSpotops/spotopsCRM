const axios = require('axios');
require('dotenv').config();

let cachedToken = null;
let tokenExpiry = null;

async function getSpeedShipToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.SPEEDSHIP_CLIENT_ID;
  const clientSecret = process.env.SPEEDSHIP_CLIENT_SECRET;
  const tokenUrl = 'https://api.sandbox.speedship.io/oauth/token';

  try {
    const response = await axios.post(tokenUrl, {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    });

    cachedToken = response.data.access_token;
    // Set token expiry to now + token lifespan (in ms)
    tokenExpiry = now + response.data.expires_in * 1000;
    return cachedToken;
  } catch (err) {
    console.error("Failed to fetch SpeedShip token", err.message);
    throw new Error("Authentication failed");
  }
}

module.exports = { getSpeedShipToken };
