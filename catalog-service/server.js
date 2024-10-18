const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const { parse } = require("json2csv");
const { log } = require("console");
const readCSVFile = require("./CRUD");
const writeCSVFile = require("./CRUD");
const app = express();
const port = 3001;

// Search by topic
app.get("/search/:topic", (req, res) => {
  const topic = req.params.topic;
  let results = [];

  fs.createReadStream("catalog.csv")
    .pipe(csv())
    .on("data", (data) => {
      if (data.topic === topic) {
        results.push(data);
      }
    })
    .on("end", () => {
      res.json(results);
    });
});

// Get info  by item number
app.get("/info/:item_number", (req, res) => {
  const itemNumber = req.params.item_number;
  let found = false;

  fs.createReadStream("catalog.csv")
    .pipe(csv())
    .on("data", (data) => {
      if (data.item_number === itemNumber) {
        res.json(data);
        found = true;
      }
    })
    .on("end", () => {
      if (!found) {
        res
          .status(404)
          .json({ message: `Book with item number ${itemNumber} not found` });
      }
    });
});

app.post("/update-quantity/:item_number", async (req, res) => {
  const itemNumber = req.params.item_number;
  try {
    const response = await axios.get(
      `http://localhost:3001/info/${itemNumber}`
    );
    const book = response.data;
    console.log(book);

    const books = await readCSVFile();
    const bookToUpdate = books.find((b) => b.item_number === itemNumber);

    if (!bookToUpdate) {
      return res.status(404).json({ message: "Book not found in CSV" });
    }

    if (parseInt(bookToUpdate.quantity) > 0) {
      bookToUpdate.quantity = parseInt(bookToUpdate.quantity) - 1;
      await writeCSVFile(books);
      res.json({ message: `Successfully purchased ${book.title}` });
    } else {
      res.status(400).json({ message: "Out of stock" });
    }
  } catch (err) {
    res.status(404).json({ message: "Book not found" });
  }
});

app.listen(port, () => {
  console.log(`Catalog service is running on http://localhost:${port}`);
});
