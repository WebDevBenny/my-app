const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3001;

app.use(express.json());

const CSV_FILE_PATH = path.join(__dirname, "participants.csv");

// Initialisiere die CSV-Datei, falls sie nicht existiert
if (!fs.existsSync(CSV_FILE_PATH)) {
  fs.writeFileSync(CSV_FILE_PATH, "Name\n", "utf8");
}

// Endpunkt zum Hinzufügen eines Benutzernamens zur CSV-Datei
app.post("/add-participant", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  fs.appendFileSync(CSV_FILE_PATH, `${name}\n`, "utf8");
  res.status(200).json({ message: "Participant added" });
});

// Endpunkt zum Abrufen der Teilnehmerliste
app.get("/participants", (req, res) => {
  const data = fs.readFileSync(CSV_FILE_PATH, "utf8");
  res.status(200).send(data);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
