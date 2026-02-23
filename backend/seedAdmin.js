const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User'); // Ensure this path matches your setup

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Connect to your database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database...');

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // 3. Create or Update the Admin user
    const adminEmail = 'admin@felicity.iiit.ac.in';
    
    await User.findOneAndUpdate(
      { role: 'Admin' }, 
      { 
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
        isApproved: true
      },
      { new: true, upsert: true } // Creates the user if they don't exist
    );

    console.log(`\nSUCCESS! Admin injected into the database.`);
    console.log(`Login Email: ${adminEmail}`);
    console.log(`Login Password: admin123\n`);
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();