const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv'); // convert json to csv

const app = express();
const port = 3000;

app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Welcome to Bazar.com!');
});

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

// Get info by number
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

// Purchase a book
app.post('/purchase/:item_number', (req, res) => {
    const itemNumber = req.params.item_number;
    let catalog = [];

    fs.createReadStream('catalog.csv')
        .pipe(csv())
        .on('data', (data) => {
            catalog.push(data);
        })
        .on('end', () => {
            let book = catalog.find(book => book.item_number === itemNumber);
            if (!book) {
                res.status(404).json({ message: 'Book not found' });
            } else if (parseInt(book.quantity) > 0) {
                book.quantity = parseInt(book.quantity) - 1;
                const csvData = parse(catalog);
                fs.writeFileSync('catalog.csv', csvData);
                res.json({ message: `Successfully purchased ${book.title}` });
            } else {
                res.status(400).json({ message: 'Out of stock' });
            }
        });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
