const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const initAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for initialization');

        const existingAdmin = await User.findOne({ email: 'admin@bunk.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = new User({
            name: 'Main Admin',
            email: 'admin@bunk.com',
            password: hashedPassword,
            role: 'admin',
            isActive: true
        });

        await admin.save();
        console.log('Default Admin Created: admin@bunk.com / admin123');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

initAdmin();
