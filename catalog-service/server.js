const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const port = 3001; 

// Search by topic
app.get('/search/:topic', (req, res) => {
    const topic = req.params.topic;
    let results = [];

    fs.createReadStream('catalog.csv')
        .pipe(csv())
        .on('data', (data) => {
            if (data.topic === topic) {
                results.push(data);
            }
        })
        .on('end', () => {
            res.json(results);
        });
});

// Get info  by item number
app.get('/info/:item_number', (req, res) => {
    const itemNumber = req.params.item_number;
    let found = false;

    fs.createReadStream('catalog.csv')
        .pipe(csv())
        .on('data', (data) => {
            if (data.item_number === itemNumber) {
                res.json(data);
                found = true;
            }
        })
        .on('end', () => {
            if (!found) {
                res.status(404).json({ message: `Book with item number ${itemNumber} not found` });
            }
        });
});

app.listen(port, () => {
    console.log(`Catalog service is running on http://localhost:${port}`);
});
