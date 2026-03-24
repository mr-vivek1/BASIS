const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { readData, writeData } = require('../utils/persistentStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @route   GET api/tanks
router.get('/', auth, async (req, res) => {
    if (!isDBConnected()) {
        const tanks = readData('tanks');
        if (tanks.length === 0) {
            const initialTanks = [
                { _id: 'tank-1', tankName: 'Tank-1 (Main North)', fuelType: 'Petrol', capacity: 35000, currentVolume: 8500 },
                { _id: 'tank-2', tankName: 'Tank-2 (Main South)', fuelType: 'Diesel', capacity: 35000, currentVolume: 12000 },
                { _id: 'tank-3', tankName: 'Tank-3 (Auxiliary)', fuelType: 'CNG', capacity: 35000, currentVolume: 4200 }
            ];
            writeData('tanks', initialTanks);
            return res.json(initialTanks);
        }

        return res.json(tanks);
    }

    try {
        const Tank = require('../models/Tank');
        let tanks = await Tank.find();
        if (tanks.length === 0) {
            tanks = await Tank.insertMany([
                { tankName: 'Tank-1 (Main North)', fuelType: 'Petrol', capacity: 10000, currentVolume: 8500 },
                { tankName: 'Tank-2 (Main South)', fuelType: 'Diesel', capacity: 15000, currentVolume: 12000 },
                { tankName: 'Tank-3 (Auxiliary)', fuelType: 'CNG', capacity: 5000, currentVolume: 4200 }
            ]);
        }
        res.json(tanks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/tanks
router.post('/', auth, async (req, res) => {
    const { tankName, fuelType, capacity, currentVolume } = req.body;
    if (!isDBConnected()) {
        const tanks = readData('tanks');
        const newTank = { 
            _id: `file-tank-${Date.now()}`, 
            tankName, fuelType, 
            capacity: parseFloat(capacity), 
            currentVolume: parseFloat(currentVolume) || 0 
        };
        tanks.push(newTank);
        writeData('tanks', tanks);
        return res.json(newTank);
    }
    try {
        const Tank = require('../models/Tank');
        const newTank = new Tank({ tankName, fuelType, capacity, currentVolume });
        await newTank.save();
        res.json(newTank);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/tanks/refill/:id
// NOTE: This must come BEFORE the generic PUT /:id to avoid route collision
router.put('/refill/:id', auth, async (req, res) => {
    const { refillAmount } = req.body;
    if (!isDBConnected()) {
        const tanks = readData('tanks');
        const tank = tanks.find(t => t._id === req.params.id);
        if (!tank) return res.status(404).json({ msg: 'Tank not found' });
        tank.currentVolume = Math.min(tank.capacity, tank.currentVolume + parseFloat(refillAmount));
        writeData('tanks', tanks);
        return res.json(tank);
    }
    try {
        const Tank = require('../models/Tank');
        const tank = await Tank.findById(req.params.id);
        if (!tank) return res.status(404).json({ msg: 'Tank not found' });
        tank.currentVolume = Math.min(tank.capacity, tank.currentVolume + parseFloat(refillAmount));
        await tank.save();
        res.json(tank);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/tanks/:id
router.put('/:id', auth, async (req, res) => {
    const { tankName, fuelType, capacity, currentVolume } = req.body;
    if (!isDBConnected()) {
        const tanks = readData('tanks');
        const tank = tanks.find(t => t._id === req.params.id);
        if (!tank) return res.status(404).json({ msg: 'Tank not found' });
        if (tankName) tank.tankName = tankName;
        if (fuelType) tank.fuelType = fuelType;
        if (capacity) tank.capacity = parseFloat(capacity);
        if (currentVolume !== undefined) tank.currentVolume = parseFloat(currentVolume);
        writeData('tanks', tanks);
        return res.json(tank);
    }
    try {
        const Tank = require('../models/Tank');
        const tank = await Tank.findByIdAndUpdate(
            req.params.id, 
            { $set: { tankName, fuelType, capacity, currentVolume } }, 
            { new: true }
        );
        res.json(tank);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/tanks/:id
router.delete('/:id', auth, async (req, res) => {
    if (!isDBConnected()) {
        const tanks = readData('tanks');
        const filtered = tanks.filter(t => t._id !== req.params.id);
        writeData('tanks', filtered);
        return res.json({ msg: 'Tank removed' });
    }
    try {
        const Tank = require('../models/Tank');
        await Tank.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Tank removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
