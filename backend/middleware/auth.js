// const Token = require('../models/Token');

// async function authMiddleware(req, res, next) {
//     const authHeader = req.header('Authorization');
//     if (!authHeader) {
//         return res.status(401).json({ msg: 'No token, authorization denied' });
//     }

//     const token = authHeader.replace('Bearer ', '');
//     console.log("Received token:", token);

//     try {
//         const tokenDocument = await Token.findOne({ token });
//         if (!tokenDocument) {
//             return res.status(401).json({ msg: 'Token is not valid' });
//         }

//         req.user = { userId: tokenDocument.userId };
//         next();
//     } catch (err) {
//         res.status(401).json({ message: 'Token is not valid' });
//     }
// }

// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Token = require('../models/Token');

async function authMiddleware(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log("authM",token);
    try {
        const tokenDocument = await Token.findOne({ token });
        if (!tokenDocument) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }

        const decoded = jwt.verify(token, 'your_jwt_secret'); // Replace with your secret
        req.user = { _id: decoded.userId, role: decoded.role };
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = authMiddleware;
