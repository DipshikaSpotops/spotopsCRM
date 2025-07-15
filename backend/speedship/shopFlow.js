const axios = require('axios');
require('dotenv').config();

async function getRates(payload) {
  const url = `${process.env.SPEEDSHIP_API_BASE}/shopFlow`;
  console.log("url",process.env.SPEEDSHIP_API_BASE);
  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.SPEEDSHIP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (err) {
    console.error('shopFlow error:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { getRates };
