const express = require("express");
const axios = require("axios");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");

// connection postgre
const pool = new Pool({
  user: "mnljupmw",
  host: "salt.db.elephantsql.com",
  database: "mnljupmw",
  password: "nHq0_miU7ryNwmjIE6cnggsBkdD08Lhz",
  port: 5432,
});

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "https://congenial-goldfish-9p54qwqvg9x3x4rv-5173.app.github.dev",
  })
);
app.use(bodyParser.json());

// routes
// app.get('/pokemon', async (req, res) => {
//     try {
//         const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=100&offset=0`)
//         const pokemon = response.data

//         res.json(pokemon)
//     } catch (e) {
//         res.status(404).json({ message: "All pokemon not found" })
//     }
// })

// app.get('/pokemon/:id', async (req, res) => {
//     try {
//         const id = req.params.id
//         const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
//         const pokemon = response.data

//         res.json(pokemon)
//     } catch (e) {
//         res.status(404).json({ message: "Pokemon not found!" })
//     }
// })

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
        "INSERT INTO pokedexes (pokemon_name, name, height, weight, image) VALUES ($1 ,$1, $2, $3, $4) RETURNING *";
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
    // console.error(e);
    res.status(404).json({ message: "Pokemon not found!" });
  }
});

app.patch("/pokemon/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const query = "UPDATE pokedexes SET name = LOWER($1) WHERE id = $2";
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
  try {
  } catch (error) {}
});

app.listen(PORT, () => {
  console.log("Server running on port 3000!");
});
