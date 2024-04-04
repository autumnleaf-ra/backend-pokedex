const express = require('express')
const axios = require('axios')
const { Pool } = require('pg')

// connection postgre
const pool = new Pool({
    user: 'mnljupmw',
    host: 'salt.db.elephantsql.com',
    database: 'mnljupmw',
    password: 'nHq0_miU7ryNwmjIE6cnggsBkdD08Lhz',
    port: 5432,
})

const app = express()
const PORT = 3000

// routes
app.get('/pokemon', async (req, res) => {
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=100&offset=0`)
        const pokemon = response.data

        res.json(pokemon)
    } catch (e) {
        res.status(404).json({ message: "All pokemon not found" })
    }
})

app.get('/pokemon/:id', async (req, res) => {
    try {
        const id = req.params.id
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
        const pokemon = response.data

        res.json(pokemon)
    } catch (e) {
        res.status(404).json({ message: "Pokemon not found!" })
    }
});


app.get('/pokemon/catch/:id', async (req, res) => {
    try {
        const id = req.params.id
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
        const pokemon = response.data

        const randomNum = Math.random()
        const probability = 0.5

        if (randomNum < probability) {
            res.json({ success: true, pokemon })
        } else {
            res.json({ success: false, message: 'The Pokémon got away...' })
        }
    } catch (error) {
        res.status(404).json({ message: "Pokemon not found!" })
    }
})


app.listen(PORT, () => { console.log("Server running on port 3000!") })
