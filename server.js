const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());  

app.get('/', (req, res) => {
    res.send('Welcome to Bazar.com!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Search for books by topic
app.get('/search/:topic', (req, res) => {
    const topic = req.params.topic;
    // 
    res.json({ message: `Search results for topic: ${topic}` });
});

// Get info about a book
app.get('/info/:item_number', (req, res) => {
    const itemNumber = req.params.item_number;
    // 
    res.json({ message: `Details for book item number: ${itemNumber}` });
});

// Purchase a book
app.post('/purchase/:item_number', (req, res) => {
    const itemNumber = req.params.item_number;
    // 
    res.json({ message: `Purchase request received for book item number: ${itemNumber}` });
});

