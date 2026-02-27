const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/govt-shop-portal';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected for seeding');

        // Check if admin user already exists
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@digigov.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists, skipping seed');
        } else {
            // Warn if using default password
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            if (!process.env.ADMIN_PASSWORD) {
                console.warn('WARNING: Using default admin password. Set ADMIN_PASSWORD environment variable in production!');
            }

            // Create admin user
            const adminUser = await User.create({
                name: process.env.ADMIN_NAME || 'Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log(`Admin user created: ${adminUser.email}`);
        }

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error.message);
        process.exit(1);
    }
};

seedAdmin();
