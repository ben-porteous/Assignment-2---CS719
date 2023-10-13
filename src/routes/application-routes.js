const express = require("express");
const { getAllPokemon } = require("../db/pokemon-db");
const router = express.Router();
const db = require("../db/db.js")
const pokemonDatabase = require("../json/pokemon.json")
const fs = require("fs");
const { ifError } = require("assert");

function readJson(fileName) {
  const data = fs.readFileSync(fileName);
  return JSON.parse(data.toString("utf-8"));
}

function writeJson(object, fileName) {
  fs.writeFileSync(fileName, JSON.stringify(object));
}

//Need to update the below - currently returns all applicable "en" and need to check index accuracy 
function getEnglishDex(pokemonDexExtryJson) {
  let i = 0
  pokemonDexExtryJson.flavor_text_entries.forEach(function (item) {
    if (item.language.name == "en") {
      i++
      return(i)
    } else {
      i++
    }
  })
}

//Router for Home Site
router.get("/", function (req, res) {
  // TODO Add necessary data to res.locals before rendering the "home" page.
  const pokemon = getAllPokemon();

  res.locals.pokemon = pokemon;
  res.locals.openingPokemonImage = pokemon[57].imageUrl;
  res.locals.openingPokemonNumber = pokemon[57].dexNumber;
  res.locals.openingPokemonName = pokemon[57].name;
  res.locals.openingPokemonTypes = pokemon[57].types;
  res.locals.openingPokemonAbout = pokemon[57].dexEntry;

  res.render("home");
});



//Function for processing dexNumber search data - returns user home
router.get("/dexSearch", async function (req, res) {
  const dexNumber = req.query.newPokemonDex
  const pokemonString = await fetch(`https://pokeapi.co/api/v2/pokemon/${dexNumber}`)
  const pokemonJson = await pokemonString.json()
  const pokemonDexEntryString = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${dexNumber}`);
  const pokemonDexExtryJson = await pokemonDexEntryString.json()
  const types = []
  pokemonJson.types.forEach(function (type) {
    types.push(type.type.name)
  })
  const requiredPokemonJson = {
    dexNumber: dexNumber,
    name: `${pokemonJson.species.name}`,
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dexNumber}.png`,
    smallImageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`,
    types: `${types}`,
    dexEntry: pokemonDexExtryJson.flavor_text_entries[0].flavor_text
  }

  const pokemonJsonFile = readJson("./src/json/pokemon.json")
  const stringedDatabase = JSON.stringify(pokemonJsonFile)

  if (stringedDatabase.includes(dexNumber)) {
    console.log("This pokemon is already in the list")
  } else {
    const testing232 = getEnglishDex(pokemonDexExtryJson) // Returns undefined rather than value
    console.log(testing232) // as above - returns undefined rather than value
    pokemonJsonFile.push(requiredPokemonJson)
    writeJson(pokemonJsonFile, "./src/json/pokemon.json")
  }



  res.redirect("/")
})

module.exports = router;


