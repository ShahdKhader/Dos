const axios = require("axios");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Welcome to Bazar.com!");

function showMenu() {
  console.log("\nWhat would you like to do?");
  console.log("1. Search for books by topic");
  console.log("2. Get info about a book");
  console.log("3. Purchase a book");
  console.log("4. Exit");
  rl.question("Choose an option (1-4): ", handleUserInput);
}

function handleUserInput(option) {
  switch (option) {
    case "1":
      rl.question(
        "Enter the topic (distributed systems / undergraduate school): ",
        searchBooks
      );
      break;
    case "2":
      rl.question("Enter the item number of the book: ", getBookInfo);
      break;
    case "3":
      rl.question(
        "Enter the item number of the book to purchase: ",
        purchaseBook
      );
      break;
    case "4":
      console.log("Goodbye!");
      rl.close();
      break;
    default:
      console.log("Invalid option. Try again.");
      showMenu();
  }
}

function searchBooks(topic) {
  axios
    .get(`http://catalog-service:3001/search/${topic}`)
    .then((response) => {
      console.log("Books found:");
      console.table(response.data);
      showMenu();
    })
    .catch((err) => {
      console.log("Error:", err.response ? err.response.data : err.message);
      showMenu();
    });
}

function getBookInfo(itemNumber) {
  axios
    .get(`http://catalog-service:3001/info/${itemNumber}`)
    .then((response) => {
      console.log("Book info:");
      console.table([response.data]);
      showMenu();
    })
    .catch((err) => {
      console.log("Error:", err.response ? err.response.data : err.message);
      showMenu();
    });
}

function purchaseBook(itemNumber) {
  axios
    .post(`http://order-service:3002/purchase/${itemNumber}`)
    .then((response) => {
      console.log(response.data.message);
      showMenu();
    })
    .catch((err) => {
      console.log("Error:", err.response ? err.response.data : err.message);
      showMenu();
    });
}

// Start the application
showMenu();
