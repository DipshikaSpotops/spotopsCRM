const axios = require('axios');
const { getAccessToken } = require('./tokenService');

async function getRates(payload) {
  const token = await getAccessToken();

  const response = await axios.post(
    'https://api.sandbox.speedship.io/shopFlow',  // update if real path differs
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

module.exports = { getRates };