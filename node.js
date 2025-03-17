const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = 'postings.json';

app.use(express.json());
app.use(cors());

// Load job postings
const loadPostings = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE));
};

// Save job postings
const savePostings = (postings) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(postings, null, 2));
};

// Get all job postings
app.get('/postings', (req, res) => {
    res.json(loadPostings());
});

// Add a new job posting (unapproved by default)
app.post('/postings', (req, res) => {
    const postings = loadPostings();
    const newPosting = { id: Date.now(), ...req.body, approved: false };
    postings.push(newPosting);
    savePostings(postings);
    res.status(201).json(newPosting);
});

// Approve a job posting
app.put('/postings/:id/approve', (req, res) => {
    const postings = loadPostings();
    const posting = postings.find(p => p.id == req.params.id);
    if (!posting) return res.status(404).json({ error: 'Posting not found' });
    posting.approved = true;
    savePostings(postings);
    res.json(posting);
});

// Delete a job posting
app.delete('/postings/:id', (req, res) => {
    let postings = loadPostings();
    postings = postings.filter(p => p.id != req.params.id);
    savePostings(postings);
    res.json({ message: 'Posting deleted' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
