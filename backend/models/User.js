const mongoose = require('mongoose');
const { schema } = require('./Team');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    team: { 
        type: String, 
        required: function() { return this.role !== 'Admin'; } // Only required if role is not Admin
    },
    role: { type: String, required: true },
    
});



module.exports = mongoose.model('User', userSchema);



