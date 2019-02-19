const express = require("express");
const helmet = require("helmet");

const knex = require("knex");

const knexConfig = {
  client: "sqlite3",
  connection: {
    filename: "./data/lambda.sqlite3"
  },
  useNullAsDefault: true
};

const db = knex(knexConfig);

const server = express();

server.use(express.json());
server.use(helmet());

// endpoints here

server.get("/api/zoos", async (req, res) => {
  try {
    const zoos = await db("zoos");
    res.status(200).json(zoos);
  } catch (error) {
    res.status(500).json({ error: "Error while getting zoos" });
  }
});

server.get("/api/zoos/:id", async (req, res) => {
  try {
    const zoo = await db("zoos")
      .where({ id: req.params.id })
      .first();
    if (zoo) {
      res.status(200).json(zoo);
    } else {
      res.status(404).json({ error: "Zoo not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error while getting zoo" });
  }
});

server.post("/api/zoos", async (req, res) => {
  try {
    if (!req.body.name) {
      res.status(400).json({ error: "Please provide a name for new zoo." });
    } else {
      const [id] = await db("zoos").insert(req.body);
      res.status(201).json(id);
    }
  } catch (error) {
    res.status(500).json({ error: "Error while inserting zoo" });
  }
});

server.delete("/api/zoos/:id", async (req, res) => {
  try {
    const count = await db("zoos")
      .where({ id: req.params.id })
      .del();
    if (count > 0) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: "Zoo not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error while deleting zoo" });
  }
});

server.put("/api/zoos/:id", async (req, res) => {
  try {
    if (!req.body.name) {
      res.status(400).json({ error: "Please provide a name for new zoo." });
    } else {
      const count = await db("zoos")
        .where({ id: req.params.id })
        .update(req.body);
      if (count > 0) {
        const zoo = await db("zoos")
          .where({ id: req.params.id })
          .first();
        res.status(200).json(zoo);
      } else {
        res.status(404).json({ error: "Zoo not found" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Error while deleting zoo" });
  }
});

const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
