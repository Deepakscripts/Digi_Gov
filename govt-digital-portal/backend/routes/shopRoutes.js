const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Get all shops (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const shops = await Shop.find({}).populate('userId', 'name email');
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Shop (Admin)
router.post('/', protect, adminOnly, async (req, res) => {
    const { shopName, ownerName, licenseNumber, address, contactNumber, email, password } = req.body;

    try {
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check if license exists
        const licenseExists = await Shop.findOne({ licenseNumber });
        if (licenseExists) {
            return res.status(400).json({ message: 'Shop with this license number already exists' });
        }

        const user = await User.create({
            name: ownerName,
            email,
            password,
            role: 'shop',
        });

        if (user) {
            const shop = await Shop.create({
                shopName,
                ownerName,
                licenseNumber,
                address,
                contactNumber,
                userId: user._id,
            });

            user.shopId = shop._id;
            await user.save();

            res.status(201).json(shop);
        } else {
            res.status(400).json({ message: 'Invalid shop data' });
        }
    } catch (error) {
        // Handle Mongoose duplicate key error (if any slips through)
        if (error.code === 11000) {
            if (error.keyPattern.email) return res.status(400).json({ message: 'User with this email already exists' });
            if (error.keyPattern.licenseNumber) return res.status(400).json({ message: 'License number already exists' });
        }
        res.status(500).json({ message: error.message });
    }
});

// Update Shop (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
    const { shopName, ownerName, address, contactNumber, password } = req.body;

    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Update shop fields
        shop.shopName = shopName || shop.shopName;
        shop.ownerName = ownerName || shop.ownerName;
        shop.address = address || shop.address;
        shop.contactNumber = contactNumber || shop.contactNumber;
        await shop.save();

        // Update user name and optionally password
        const user = await User.findById(shop.userId);
        if (user) {
            user.name = ownerName || user.name;
            if (password && password.trim() !== '') {
                user.password = password;
            }
            await user.save();
        }

        const updatedShop = await Shop.findById(shop._id).populate('userId', 'name email');
        res.json(updatedShop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Shop
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (shop) {
            await User.findByIdAndDelete(shop.userId);
            await shop.deleteOne();
            res.json({ message: 'Shop removed' });
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
