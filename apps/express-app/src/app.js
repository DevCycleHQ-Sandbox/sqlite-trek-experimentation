require("dotenv").config({ path: "../../.env" }); // Specify the relative path to the .env file

const express = require("express");
const initializeDevCycle = require("./devcycle");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { createClient } = require("@libsql/client"); // Turso Client
const { Database } = require("@sqlitecloud/drivers");

// Configurations from environment variables
const CONFIG = {
  LOCAL_SQLITE: process.env.LOCAL_SQLITE,
  TURSO: {
    URL: process.env.TURSO_URL,
    AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
  },
  SQLITE_CLOUD_CONNECTION: process.env.SQLITE_CLOUD_CONNECTION,
};

// Search function to filter Star Trek series
const searchStarTrekSeries = (searchTerm, data) =>
  data.find(
    (item) =>
      [item.series_name, item.captain, item.description].some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      item.crew
        .split(",")
        .some((crewMember) =>
          crewMember.trim().toLowerCase().includes(searchTerm.toLowerCase())
        )
  );

// Query functions for databases
const queryLocalSQLite = (searchTerm) =>
  new Promise((resolve, reject) => {
    const db = new sqlite3.Database(CONFIG.LOCAL_SQLITE);
    db.all("SELECT * FROM star_trek_series", (err, rows) => {
      db.close();
      if (err) reject(err);
      resolve(searchStarTrekSeries(searchTerm, rows));
    });
  });

const queryTurso = async (searchTerm) => {
  const client = createClient({
    url: CONFIG.TURSO.URL,
    authToken: CONFIG.TURSO.AUTH_TOKEN,
  });
  const response = await client.execute("SELECT * FROM star_trek_series");
  return searchStarTrekSeries(searchTerm, response.rows);
};

const querySQLiteCloud = async (searchTerm) => {
  const db = new Database(CONFIG.SQLITE_CLOUD_CONNECTION);
  const response = await db.sql(`
    USE DATABASE test;
    SELECT * FROM star_trek_series;
  `);
  return searchStarTrekSeries(searchTerm, response);
};

function generateUserId() {
  return "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

// Main server function
const run = async () => {
  const devcycleClient = await initializeDevCycle();
  const app = express();

  // Middleware setup
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static("public"));
  app.set("view engine", "ejs");

  app.use((req, res, next) => {
    req.user = {
      user_id: generateUserId(),
    };
    next();
  });

  // Routes
  app.get("/", (req, res) => {
    res.render("index", { query_time: null, db_type: null, data: null });
  });

  app.post("/search", async (req, res) => {
    const { user } = req;
    const searchTerm = req.body.query;
    const startTime = Date.now();

    if (!searchTerm) {
      return res.status(400).render("index", {
        query_time: null,
        db_type: null,
        data: "Please provide a search term",
      });
    }

    try {
      const flag = devcycleClient.variable(
        user,
        "sqlite-trek-experiment",
        "local"
      );
      const dbQueries = {
        local: { query: queryLocalSQLite, dbType: "Local SQLite" },
        turso: { query: queryTurso, dbType: "Turso" },
        cloud: { query: querySQLiteCloud, dbType: "SQLite Cloud" },
      };
      const { query, dbType } = dbQueries[flag.value] || dbQueries.turso;

      const result = await query(searchTerm);
      const responseTime = Date.now() - startTime;

      res.render("index", {
        query_time: `${responseTime}ms`,
        db_type: dbType,
        data: result?.series_name
          ? result
          : `No results found for '${searchTerm}'`,
      });

      // Track response time
      res.on("finish", () =>
        devcycleClient.track(user, {
          type: "response_time",
          value: responseTime,
        })
      );
    } catch (error) {
      res.status(500).render("index", {
        query_time: null,
        db_type: null,
        data: "Internal Server Error",
      });
    }
  });

  return app;
};

module.exports = run;
