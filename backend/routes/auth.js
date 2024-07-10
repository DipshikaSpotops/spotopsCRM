const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Token = require('../models/Token');  // Add Token model
const generateToken = require('../../utils/tokenGenerator');
const authMiddleware = require('../middleware/auth');
const OrderNo = require('../models/OrderNo');




router.post('/signup', async (req, res) => {
    const { fName, lName, email, password, role } = req.body;
    console.log("==", fName, lName);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstName: fName,
            lastName: lName,
            email,
            password: hashedPassword,
            role
        });
        console.log("user", user);
        await user.save();
        console.log("User saved, signed up");

        const tokenValue = generateToken();
        const token = new Token({ token: tokenValue, userId: user._id });
        await token.save();
        console.log("Token saved to database:", token);

        res.json({ token: tokenValue });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error registering user', error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        // Uncomment the password checking code if needed
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) {
        //     return res.status(400).json({ msg: 'Invalid email or password' });
        // }

        const tokenValue = generateToken();
        const token = new Token({ token: tokenValue, userId: user._id });
        await token.save();
        console.log("Token saved to database:", token);

        res.json({ token: tokenValue, firstName: user.firstName,team: user.team });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error logging in user', error: err.message });
    }
});

module.exports = router;


router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error fetching teams', error: err.message });
    }
});



// Endpoint to get the token for the current user
router.get('/token', authMiddleware, async (req, res) => {
    console.log("token");
    try {
        const userId = req.user._id; 
        const tokenDocument = await Token.findOne({ userId });
        if (!tokenDocument) {
            return res.status(404).json({ msg: 'Token not found' });
        }
        res.json({ token: tokenDocument.token });
    } catch (error) {
        console.error('Error fetching token diddi:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});



// Route to get the current order number
router.get('/currentOrderNo', async (req, res) => {
  try {
    const orderNo = await OrderNo.findOne();
    console.log("orderNo",orderNo);
    if (!orderNo) {
      return res.status(404).send('Order number not found');
    }
    res.send({ currentOrderNo: orderNo.latestOrderNo });
  } catch (error) {
    console.error('Error fetching current order number:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;




