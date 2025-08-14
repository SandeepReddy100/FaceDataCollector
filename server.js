// --- 1. SETUP ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// ✅ Load environment variables FIRST
dotenv.config();

// Create the Express app
const app = express();

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// --- 3. MONGOOSE SCHEMA & MODEL ---
const studentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    faceDescriptor: { type: Array, required: true },
    confidence: { type: Number, required: true },
    registrationDate: { type: String, default: () => new Date().toISOString() },
    lastUpdated: { type: String, default: () => new Date().toISOString() },
    createdAt: { type: String, default: () => new Date().toISOString() }
});

const Student = mongoose.model('Student', studentSchema);

// --- 4. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected via Mongoose'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// --- 5. API ROUTE ---
app.post('/api/register-face', async (req, res) => {
    const { studentId, faceDescriptor, confidence, timestamp } = req.body;

    // Validate the incoming data
    if (!studentId || !faceDescriptor) {
        return res.status(400).json({ 
            message: "Invalid data: studentId and faceDescriptor are required." 
        });
    }

    try {
        // ✅ Use Mongoose model instead of raw MongoDB client
        const faceData = {
            studentId: studentId,
            faceDescriptor: faceDescriptor,
            confidence: confidence,
            registrationDate: timestamp || new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        // Find student by ID and update/create record using Mongoose
        const result = await Student.findOneAndUpdate(
            { studentId: studentId },
            faceData,
            { 
                upsert: true, // Create if doesn't exist
                new: true,    // Return updated document
                setDefaultsOnInsert: true
            }
        );

        console.log(`Student ${studentId} face data stored successfully.`);
        console.log('Face descriptor length:', faceDescriptor.length);
        
        res.status(201).json({ 
            message: "Face registration successful!",
            studentId: studentId,
            confidence: confidence
        });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ 
            message: "Database error occurred",
            error: err.message 
        });
    }
    // ✅ No need to close connection - Mongoose manages this
});

// --- 6. START THE SERVER ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running successfully on http://127.0.0.1:${PORT}`);
});
