
// temp file to create admin in database
// to run, use 'node seedAdmin.js'

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User'); 

dotenv.config();
const seedAdmin = async () => {
  try {
    // connect 
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database...');

    //hardcoded values for admin in backend
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
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
      { new: true, upsert: true } 
    );

    console.log(`\nAdmin injected into the database.`);
    console.log(`Login Email: ${adminEmail}`);
    console.log(`Login Password: admin123\n`);
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();