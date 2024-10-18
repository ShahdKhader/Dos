const express = require("express");
const axios = require("axios");

const app = express();
const port = 3002;

app.post("/purchase/:item_number", (req, res) => {
  const itemNumber = req.params.item_number;
  axios.post(`http://localhost:3001/update-quantity/${itemNumber}`);
});

app.listen(port, () => {
  console.log(`Order service is running on http://localhost:${port}`);
});
