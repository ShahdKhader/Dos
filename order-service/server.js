const express = require('express');
const axios = require('axios');

const app = express();
const port = 3002;

app.post('/purchase/:item_number', (req, res) => {
    const itemNumber = req.params.item_number;

    axios.get(`http://localhost:3001/info/${itemNumber}`)
        .then(response => {
            const book = response.data;
            if (parseInt(book.quantity) > 0) {
                book.quantity = parseInt(book.quantity) - 1;
                res.json({ message: `Successfully purchased ${book.title}` });
            } else {
                res.status(400).json({ message: 'Out of stock' });
            }
        })
        .catch(err => {
            res.status(404).json({ message: 'Book not found' });
        });
});

app.listen(port, () => {
    console.log(`Order service is running on http://localhost:${port}`);
});
