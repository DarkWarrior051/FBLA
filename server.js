const express = require("express");
const mysql = require("mysql2"); 
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const fs = require("fs");

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password", 
    database: "sos_events",
    port: 3306
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("MySQL Connected...");
});

// API Endpoint to Save Form Data
app.post("/register", (req, res) => {
    const { eventName, name, email, size } = req.body;

    if (!eventName || !name || !email) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = "INSERT INTO registrations (event_name, name, email, t_shirt_size) VALUES (?, ?, ?, ?)";
    db.query(sql, [eventName, name, email, size || "N/A"], (err, result) => {
        if (err) {
            console.error("Database Insert Error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // Log the registration to a file
        const logEntry = `New Registration - Event: ${eventName}, Name: ${name}, Email: ${email}, Size: ${size || "N/A"}\n`;
        fs.appendFile("registrations.log", logEntry, (err) => {
            if (err) console.error("Error writing to file:", err);
        });

        res.json({ message: "Registration successful!" });
    });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

