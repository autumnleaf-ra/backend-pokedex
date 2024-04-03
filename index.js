const express = require('express');
const axios = require('axios');

const app = express();

// routes
app.get('/pokemon/:name', async (req, res) => {
    try {
        const name = req.params.name
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const pokemon = response.data

        res.json(pokemon); // Sending JSON response
    } catch (e) {
        res.status(404).json({ message: "Pokemon not found!" }); // Sending JSON error response
    }
});

const PORT = 3000;
app.listen(PORT, () => { console.log("Server running on port 3000!"); });
