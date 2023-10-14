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
  return pokemonDexExtryJson.flavor_text_entries.findIndex(function (item) {
    return item.language.name == "en"
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
    capitaliseFirstLetter(type.type)
    types.push(type.type.name)
  })

  const dexEntryIndex = getEnglishDex(pokemonDexExtryJson)

  const requiredPokemonJson = {
    dexNumber: dexNumber,
    name: `${pokemonJson.species.name}`,
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dexNumber}.png`,
    smallImageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`,
    types: `${types}`,
    dexEntry: pokemonDexExtryJson.flavor_text_entries[dexEntryIndex].flavor_text
  }

  const pokemonJsonFile = readJson("./src/json/pokemon.json")
  const stringedDatabase = JSON.stringify(pokemonJsonFile)

  if (stringedDatabase.includes(dexNumber)) {
    console.log("This pokemon is already in the list")
  } else {
    capitaliseFirstLetter(requiredPokemonJson)
    pokemonJsonFile.push(requiredPokemonJson)
    writeJson(pokemonJsonFile, "./src/json/pokemon.json")
  }

  function capitaliseFirstLetter(item) {
    const value = item.name[0].toUpperCase() 
    const updatedValue = value + item.name.slice(1);
    item.name = updatedValue
  }



  res.redirect(`/pokemon/${requiredPokemonJson.dexNumber}`)
})

router.get("/pokemon/:dexNumber", function (req, res) {
  // TODO Add necessary data to res.locals before rendering the "home" page.
  const pokemon = getAllPokemon();
  const pokemonDex = req.params.dexNumber
  console.log(pokemonDex)

  res.locals.pokemon = pokemon;
  res.locals.openingPokemonImage = pokemon[20].imageUrl;
  res.locals.openingPokemonNumber = pokemon[20].dexNumber;
  res.locals.openingPokemonName = pokemon[20].name;
  res.locals.openingPokemonTypes = pokemon[20].types;
  res.locals.openingPokemonAbout = pokemon[20].dexEntry;

  res.render("home");
});



module.exports = router;


