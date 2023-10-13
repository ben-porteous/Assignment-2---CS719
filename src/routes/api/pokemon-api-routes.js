const express = require("express");
const router = express.Router();

// TODO Add an API endpoint here.
// When sending a GET request for /:dexNumber (:dexNumber is a path param),
// return the JSON representation of the correct Pokemon, or return a 404 error
// if that Pokemon is not found.
router.get("/test", function (req, res) {
    res.send("TESTING")
})

//If client visits/requests /api/pokemon/:dexNumber then individaul json pokemon data returned 
router.get("/:dexNumber", function (req, res) {
    const pokemonJson = require("../../db/pokemon-db.js")
    if (pokemonJson.getPokemonByDexNumber(req.params.dexNumber)) {
        res.json(pokemonJson.getPokemonByDexNumber(req.params.dexNumber))
    } else {
        res.sendStatus(404)
    }
});


module.exports = router;
