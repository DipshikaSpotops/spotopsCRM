const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    team: { type: String, enum: ['Team Charlie', 'Team Mark', 'Team Sussane'], required: true },
    role: { type: String, enum: ['Admin', 'Sales', 'Support'], required: true },
    name: { type: String, required: true }
});
module.exports = mongoose.model('Team', TeamSchema);

