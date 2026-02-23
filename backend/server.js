require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes')
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const userRoutes = require('./routes/userRoutes');

// to make sure .env file is populated correctly
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // to recieve and send data in jsons (middleware)
// to allow frontend-backend communication
app.use(cors({
  origin: ["http://localhost:5173", "https://felicity-event-management-3sve1013l-sohanwithanms-projects.vercel.app"],
  credentials: true
}));

app.use('/api/auth', authRoutes); //authorization for email
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);


// to connect to the db
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // failed connection
    }
};

// initial connection call
connectDB();

// root route for testing
app.get('/', (req, res) => {
    res.send('felicity event manager api is running');
});

// starting the server: wither with own port or local machine.
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});