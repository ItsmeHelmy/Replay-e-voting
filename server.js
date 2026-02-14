const express = require("express");
const initSqlJs = require("sql.js");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "votes.db");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

let db;

// Save database to file
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Initialize database
async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log("Loaded existing database");
  } else {
    db = new SQL.Database();
    console.log("Created new database");
  }

  // Create tables if they don't exist
  db.run(`
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            lead TEXT NOT NULL,
            colead TEXT NOT NULL,
            input_date TEXT NOT NULL,
            input_time TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS candidates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            position TEXT NOT NULL,
            candidate_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL
        )
    `);

  // Insert default candidates if not exist
  const defaultCandidates = [
    ["lead", "lead1", "Farizal"],
    ["lead", "lead2", "Ridwan"],
    ["colead", "colead1", "Dea"],
    ["colead", "colead2", "Keisya"],
  ];

  defaultCandidates.forEach(([position, candidate_id, name]) => {
    try {
      db.run(
        `INSERT OR IGNORE INTO candidates (position, candidate_id, name) VALUES (?, ?, ?)`,
        [position, candidate_id, name],
      );
    } catch (e) {
      // Ignore duplicate errors
    }
  });

  saveDatabase();
}

// ============ API ENDPOINTS ============

// Submit a vote
app.post("/api/vote", (req, res) => {
  try {
    const { uuid, lead, colead, input_date, input_time, timestamp } = req.body;

    // Validate required fields
    if (!uuid || !lead || !colead || !input_date || !input_time || !timestamp) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Insert vote into database
    db.run(
      `
            INSERT INTO votes (uuid, lead, colead, input_date, input_time, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        `,
      [uuid, lead, colead, input_date, input_time, timestamp],
    );

    saveDatabase();

    console.log(`Vote recorded: ${uuid}`);

    res.json({
      success: true,
      message: "Vote recorded successfully",
      uuid: uuid,
    });
  } catch (error) {
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({
        success: false,
        error: "This vote has already been recorded",
      });
    }
    console.error("Error recording vote:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record vote",
    });
  }
});

// Get all votes (for admin)
app.get("/api/votes", (req, res) => {
  try {
    const votes = db.exec("SELECT * FROM votes ORDER BY id DESC");
    const result =
      votes.length > 0
        ? votes[0].values.map((row) => ({
            id: row[0],
            uuid: row[1],
            lead: row[2],
            colead: row[3],
            input_date: row[4],
            input_time: row[5],
            timestamp: row[6],
            created_at: row[7],
          }))
        : [];
    res.json({ success: true, votes: result });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ success: false, error: "Failed to fetch votes" });
  }
});

// Get vote statistics/results
app.get("/api/results", (req, res) => {
  try {
    // Get total votes
    const totalResult = db.exec("SELECT COUNT(*) as total FROM votes");
    const totalVotes = totalResult.length > 0 ? totalResult[0].values[0][0] : 0;

    // Get lead votes breakdown
    const leadQuery = db.exec(`
            SELECT v.lead as candidate_id, c.name, COUNT(*) as votes
            FROM votes v
            LEFT JOIN candidates c ON v.lead = c.candidate_id
            GROUP BY v.lead
        `);
    const leadResults =
      leadQuery.length > 0
        ? leadQuery[0].values.map((row) => ({
            candidate_id: row[0],
            name: row[1],
            votes: row[2],
          }))
        : [];

    // Get colead votes breakdown
    const coleadQuery = db.exec(`
            SELECT v.colead as candidate_id, c.name, COUNT(*) as votes
            FROM votes v
            LEFT JOIN candidates c ON v.colead = c.candidate_id
            GROUP BY v.colead
        `);
    const coleadResults =
      coleadQuery.length > 0
        ? coleadQuery[0].values.map((row) => ({
            candidate_id: row[0],
            name: row[1],
            votes: row[2],
          }))
        : [];

    // Get recent votes (last 10)
    const recentQuery = db.exec(
      "SELECT * FROM votes ORDER BY id DESC LIMIT 10",
    );
    const recentVotes =
      recentQuery.length > 0
        ? recentQuery[0].values.map((row) => ({
            id: row[0],
            uuid: row[1],
            lead: row[2],
            colead: row[3],
            input_date: row[4],
            input_time: row[5],
            timestamp: row[6],
            created_at: row[7],
          }))
        : [];

    res.json({
      success: true,
      totalVotes,
      leadResults,
      coleadResults,
      recentVotes,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ success: false, error: "Failed to fetch results" });
  }
});

// Get candidates
app.get("/api/candidates", (req, res) => {
  try {
    const result = db.exec("SELECT * FROM candidates");
    const candidates =
      result.length > 0
        ? result[0].values.map((row) => ({
            id: row[0],
            position: row[1],
            candidate_id: row[2],
            name: row[3],
          }))
        : [];
    res.json({ success: true, candidates });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch candidates" });
  }
});

// Reset votes (admin function - be careful!)
app.delete("/api/votes/reset", (req, res) => {
  try {
    db.run("DELETE FROM votes");
    saveDatabase();
    console.log("All votes have been reset");
    res.json({ success: true, message: "All votes have been reset" });
  } catch (error) {
    console.error("Error resetting votes:", error);
    res.status(500).json({ success: false, error: "Failed to reset votes" });
  }
});

// Serve admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Start server
async function startServer() {
  await initDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`
╔════════════════════════════════════════════════════════════╗
║          REPLAY E-VOTING SERVER STARTED                    ║
╠════════════════════════════════════════════════════════════╣
║  Voting Page : http://localhost:${PORT}                    ║
║  Admin Panel : http://localhost:${PORT}/admin              ║
╠════════════════════════════════════════════════════════════╣
║  Database    : votes.db (SQLite)                           ║
║  API Base    : http://localhost:${PORT}/api                ║
╚════════════════════════════════════════════════════════════╝
        `);
  });
}

startServer();

// Gracefully close database on exit
process.on("SIGINT", () => {
  if (db) {
    saveDatabase();
    db.close();
  }
  console.log("\nDatabase saved and closed. Server stopped.");
  process.exit(0);
});
