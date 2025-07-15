const axios = require('axios');

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  const now = Date.now();

  // If token is valid and not expiring soon, reuse it
  if (cachedToken && tokenExpiry && now < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      'https://auth.staging-wwex.com/oauth/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: '8h94TCp0N6fg09ipP3yyJmfPPv5l1mCD',
        client_secret: '2xVfUgUZfR_I56yuR8tv_Q_G3IQiEqV-sNV9cf90QhjLKGN-VHAaF24VPL1ulKzQ',
        audience: 'staging-wwex-apig',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = now + response.data.expires_in * 1000; // convert to ms

    console.log('New SpeedShip token fetched');
    return cachedToken;
  } catch (error) {
    console.error('Failed to fetch token:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getAccessToken };