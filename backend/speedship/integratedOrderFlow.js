const axios = require('axios');
const { getAccessToken } = require('./tokenService');

async function createShipment(payload) {
  const url = `${process.env.SPEEDSHIP_API_BASE}/integratedOrderFlow`;

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.SPEEDSHIP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (err) {
    console.error('integratedOrderFlow error:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { createShipment };
