const axios = require("axios");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const cache = {};

const catalogReplicas = ["http://localhost:3001", "http://localhost:3002"];
const orderReplicas = ["http://localhost:3003", "http://localhost:3004"];

let catalogReplicaIndex = 0;
let orderReplicaIndex = 0;

function getNextCatalogReplica() {
  catalogReplicaIndex = (catalogReplicaIndex + 1) % catalogReplicas.length;
  console.log(catalogReplicas[catalogReplicaIndex]);
  return catalogReplicas[catalogReplicaIndex];
}

function getNextOrderReplica() {
  orderReplicaIndex = (orderReplicaIndex + 1) % orderReplicas.length;
  console.log(orderReplicas[orderReplicaIndex]);
  return orderReplicas[orderReplicaIndex];
}

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
      rl.question("Enter the topic : ", searchBooks);
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

function getFromCache(key) {
  const entry = cache[key];
  if (entry) {
    return entry.data;
  }
  return null;
}

function setCache(key, data) {
  cache[key] = { data };
}

function invalidateCache(key) {
  if (cache[key]) {
    delete cache[key];
    console.log(`Cache invalidated for ${key}`);
  }
}

function searchBooks(topic) {
  const cacheKey = `search:${topic}`;
  const cachedData = getFromCache(cacheKey);

  if (cachedData) {
    console.log("Books found (from cache):");
    console.table(cachedData);
    showMenu();
    return;
  }

  const catalogServer = getNextCatalogReplica();

  axios
    .get(`${catalogServer}/search/${topic}`)
    .then((response) => {
      console.log("Books found:");
      console.table(response.data);
      setCache(cacheKey, response.data);
      showMenu();
    })
    .catch((err) => {
      console.log("Error:", err.response ? err.response.data : err.message);
      showMenu();
    });
}

function getBookInfo(itemNumber) {
  const cacheKey = `info:${itemNumber}`;
  const cachedData = getFromCache(cacheKey);

  if (cachedData) {
    console.log("Book info (from cache):");
    console.table([cachedData]);
    showMenu();
    return;
  }

  const catalogServer = getNextCatalogReplica();

  axios
    .get(`${catalogServer}/info/${itemNumber}`)
    .then((response) => {
      console.log("Book info:");
      console.table([response.data]);
      setCache(cacheKey, response.data);
      showMenu();
    })
    .catch((err) => {
      console.log("Error:", err.response ? err.response.data : err.message);
      showMenu();
    });
}

function purchaseBook(itemNumber) {
  const orderServer = getNextOrderReplica();

  axios
    .post(`${orderServer}/purchase/${itemNumber}`)
    .then((response) => {
      console.log(response.data.message);
      const cacheKey = `info:${itemNumber}`;
      invalidateCache(cacheKey);

      axios.get(`http://localhost:3001/info/${itemNumber}`).then((response) => {
        const topic = response.data.topic;
        const searchCacheKey = `search:${topic}`;
        invalidateCache(searchCacheKey);
      });

      showMenu();
    })
    .catch((err) => {
      console.log("Error:", err.response ? err.response.data : err.message);
      showMenu();
    });
}

showMenu();
