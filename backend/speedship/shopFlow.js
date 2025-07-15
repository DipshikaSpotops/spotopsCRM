const axios = require('axios');
const { getAccessToken } = require('./tokenService');

async function getRates(payload) {
  const token = await getAccessToken();

  const response = await axios.post(
    `${process.env.SPEEDSHIP_API_BASE}/shopFlow`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }
  );

  return response.data;
}

module.exports = { getRates };
