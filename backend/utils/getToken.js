const axios = require('axios');

async function fetchBearerToken() {
  try {
    const response = await axios.post('https://auth.staging-wwex.com/oauth/token', new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: '8h94TCp0N6fg09ipP3yyJmfPPv5l1mCD',
      client_secret: '2xVfUgUZfR_I56yuR8tv_Q_G3IQiEqV-sNV9cf90QhjLKGN-VHAaF24VPL1ulKzQ',
      audience: 'staging-wwex-apig'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data.access_token;
  } catch (err) {
    console.error('Failed to fetch token:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { fetchBearerToken };