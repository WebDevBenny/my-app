const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require('cors');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());
// Endpunkt zum Hinzufügen von Teilnehmern
app.post("/add-participant", (req, res) => {
  const { name } = req.body;
  const filePath = path.join(__dirname, "participants.csv");

  fs.appendFile(filePath, `${name}\n`, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.status(200).send("Participant added");
  });
});

// Endpunkt zum Hinzufügen des Einsatzes
app.post("/add-einsatz", (req, res) => {
  const { einsatz } = req.body;
  const filePath = path.join(__dirname, "einsatz.csv");

  fs.appendFile(filePath, `${einsatz}\n`, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.status(200).send("Einsatz added");
  });
});
app.get("/einsatz-values", (req, res) => {
  const filePath = path.join(__dirname, "einsatz.csv");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.status(200).send(data);
  });
});

// Endpunkt zum Abrufen der Teilnehmerliste
app.get("/participants", (req, res) => {
  const filePath = path.join(__dirname, "participants.csv");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.status(200).send(data);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
