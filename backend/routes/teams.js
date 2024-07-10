// this file is for handling team realted routes
const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

router.post('/', async (req, res) => {
    const { name, team, role } = req.body;

    try {
        const teamMember = new Team({ name, team, role });
        await teamMember.save();
        console.log("Team member saved");
        res.status(201).json(teamMember);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error creating team member', error: err.message });
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

module.exports = router;
