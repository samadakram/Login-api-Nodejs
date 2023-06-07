const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB

mongoose.connect('mongodb://127.0.0.1:27017/users', {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
})
    .catch((err) => {
        console.log('Failed to connect to MongoDB', err);
    });


// Create a user Schema

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
});

// Create a user Model

const User = mongoose.model('userData', userSchema);

const app = express();

app.use(express.json());

// Register route

app.post('/register', async (req, res) => {
    const { name, email, password, age, address } = req.body;

    try {

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            age,
            address
        });

        // Save the user to the database
        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route

app.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        return res.status(200).json({ message: 'Login successful', email: user.email, name: user.name });
    } catch (error) {
        console.error('Error during login', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// Start the server

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});