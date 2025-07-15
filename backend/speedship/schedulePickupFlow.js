const axios = require('axios');
require('dotenv').config();
const { getAccessToken } = require('./tokenService');

async function schedulePickup(payload) {
  const url = `${process.env.SPEEDSHIP_API_BASE}/schedulePickupFlow`;
console.log("process.env.SPEEDSHIP_API_BASE",process.env.SPEEDSHIP_API_BASE);
  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.SPEEDSHIP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("res",response)
    return response.data;
  } catch (err) {
    console.error('schedulePickupFlow error:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { schedulePickup };
