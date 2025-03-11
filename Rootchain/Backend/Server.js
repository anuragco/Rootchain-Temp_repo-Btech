const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 3000;
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors());
app.use(bodyParser.json());


const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    port: 4306,
    password: '',
    database: 'rootchain'
});

app.get('/', (req, res) => {
res.send('hello')
})

app.post('/api/v1/register', async (req, res) => {
    const { fullname, password, email } = req.body;

    if (!fullname || !password || !email) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        
        const checkQuery = "SELECT id FROM users WHERE email = ?";
        pool.query(checkQuery, [email], async (checkErr, checkResult) => {
            if (checkErr) {
                console.error("Database Error:", checkErr);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            if (checkResult.length > 0) {
                return res.status(400).json({ error: "Email is already registered" });
            }

            
            const hashedPassword = await bcrypt.hash(password, 10);

           
            const insertQuery = "INSERT INTO users (fullname, password, email) VALUES (?, ?, ?)";
            pool.query(insertQuery, [fullname, hashedPassword, email], (insertErr, result) => {
                if (insertErr) {
                    console.error("Database Error:", insertErr);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                res.status(201).json({ 
                    message: "User registered successfully", 
                    userId: result.insertId 
                });
            });
        });
    } catch (error) {
        console.error("Hashing Error:", error);
        res.status(500).json({ error: "Error hashing password" });
    }
});

app.post('/api/v1/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = "SELECT id, fullname, password FROM users WHERE email = ?";
    pool.query(query, [email], async (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = result[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const sessionToken = uuidv4();

        const updateQuery = "UPDATE users SET auth = ? WHERE id = ?";
        pool.query(updateQuery, [sessionToken, user.id], (updateErr) => {
            if (updateErr) {
                console.error("Session Token Error:", updateErr);
                return res.status(500).json({ error: "Failed to generate session" });
            }

            res.json({
                message: "Login successful",
                userId: user.id,
                fullname: user.fullname,
                authToken: sessionToken 
            });
        });
    });
});

app.post("/api/contact", (req, res) => {
    const { fullname, email, mobileNumber, emailSubject, message } = req.body;

    if (!fullname || !email || !mobileNumber || !emailSubject || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "INSERT INTO contacts (fullname, email, mobile_number, email_subject, message) VALUES (?, ?, ?, ?, ?)";
    pool.query(sql, [fullname, email, mobileNumber, emailSubject, message], (err, result) => {
        if (err) {
            console.error("Error inserting contact data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json({ message: "Contact form submitted successfully!" });
    });
});

app.post('/api/v1/logout', (req, res) => {
    const { userId } = req.body;

    const query = "UPDATE users SET auth = NULL WHERE id = ?";
    pool.query(query, [userId], (err) => {
        if (err) {
            console.error("Logout Error:", err);
            return res.status(500).json({ error: "Failed to logout" });
        }
        res.json({ message: "Logout successful" });
    });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});