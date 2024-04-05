const express = require("express");
const axios = require("axios");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");
const e = require("express");

// connection postgre
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "pokedexes",
  password: "postgres",
  port: 5432,
});

const app = express();
const PORT = 3000;

// setting origins
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(bodyParser.json());

function checkPrimeNumber(num) {
  if (num <= 1) {
    return false;
  }
  if (num === 2) {
    return true;
  }
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}

app.post("/pokemon/catch/:name", async (req, res) => {
  try {
    const name = req.params.name;
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${name}`
    );
    const pokemon = response.data;

    const randomNum = Math.random();
    const probability = 0.5;

    if (randomNum < probability) {
      const query =
        "INSERT INTO pokedexes (pokemon_name, name, height, weight, image, count_name) VALUES ($1 ,$1, $2, $3, $4, 0) RETURNING *";
      const values = [
        pokemon.name,
        pokemon.weight,
        pokemon.height,
        pokemon.sprites.front_default,
      ];

      const { rows } = await pool.query(query, values);
      const newPokemon = rows[0];

      res.json({ success: true, pokemon: newPokemon });
    } else {
      res.json({ success: false, message: "The Pokémon got away..." });
    }
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: "Pokemon not found!" });
  }
});

// release all
app.delete("/pokedexes/release", async (req, res) => {
  try {
    const query = "DELETE FROM pokedexes";

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/pokedexes/release/:id", async (req, res) => {
  const randomNumber = Math.floor(Math.random() * 10) + 1;
  if (checkPrimeNumber(randomNumber)) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const query = "DELETE FROM pokedexes WHERE id = $1";
      const result = await pool.query(query, [id]);

      if (result.rowCount === 1) {
        res.json({
          success: true,
          message: `Pokemon with Name ${name} has been released from the Pokedex`,
        });
      } else {
        res
          .status(404)
          .json({ message: `Pokemon with Name ${name} not found` });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.json({
      success: false,
      message: `Pokemon not released from the Pokedex`,
    });
  }
});

// my poke list
app.get("/pokedexes", async (req, res) => {
  try {
    const query = "SELECT * FROM pokedexes";

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// my pokelist by id
app.get("/pokedexes/:name", async (req, res) => {
  try {
    const name = req.params.name;

    const query = "SELECT * FROM pokedexes WHERE name = $1";
    const result = await pool.query(query, [name]);

    if (result.rowCount === 1) {
      res.json({ success: true, data: result.rows[0] });
    } else {
      res.status(404).json({ message: `Pokemon with Name ${name} not found` });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

// rename pokemon
app.patch("/pokedexes/rename/:id", async (req, res) => {
  const { id } = req.params;
  let { name } = req.body;
  var count = 0;
  if (id !== 0 && id !== undefined && name !== "") {
    try {
      const oldData = "SELECT count_name FROM pokedexes WHERE id = $1";
      const query =
        "UPDATE pokedexes SET name = LOWER($1), count_name = $2 WHERE id = $3";

      const resultOld = await pool.query(oldData, [id]);
      if (resultOld.rowCount === 1) {
        var countString = resultOld.rows[0].count_name;
        count = parseInt(countString, 10);
        if (count > 0) {
          name = name + "-" + count;
          count = count + 1;
          const result = await pool.query(query, [name, count, id]);

          if (result.rowCount === 1) {
            res.json({
              success: true,
              message: "Pokemon has been updated in the Pokedex",
              count: count,
            });
          } else {
            res
              .status(404)
              .json({ message: `Pokemon with ID ${id} not found` });
          }
        } else {
          name = name + "-" + 0;
          var countString = resultOld.rows[0].count_name;
          var count = parseInt(countString, 10);
          count = count + 1;
          const result = await pool.query(query, [name, count, id]);

          if (result.rowCount === 1) {
            res.json({
              success: true,
              message: "Pokemon has been updated in the Pokedex",
              data: count,
            });
          } else {
            res
              .status(404)
              .json({ message: `Pokemon with ID ${id} not found` });
          }
        }
      } else {
        res.status(404).json({ message: `Pokemon with ID ${id} not found` });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.json({
      success: true,
      message: "Name cannot be blank",
    });
  }
});

app.patch("/pokemon/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const query = "UPDATE pokedexes SET name = $1 WHERE id = $2";
    const result = await pool.query(query, [name, id]);

    if (result.rowCount === 1) {
      res.json({
        success: true,
        message: "Pokemon has been updated in the Pokedex",
      });
    } else {
      res.status(404).json({ message: `Pokemon with ID ${id} not found` });
    }
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
  return true;
});

app.listen(PORT, () => {
  console.log("Server running on port 3000!");
});
