const express = require("express");
const { getAllPokemon, getPokemonByDexNumber } = require("../db/pokemon-db");
const router = express.Router();
const db = require("../db/db.js")
const pokemonDatabase = require("../json/pokemon.json")
const fs = require("fs");
const { ifError } = require("assert");
const functions = require("../db/pokemon-db.js")


function readJson(fileName) {
  const data = fs.readFileSync(fileName);
  return JSON.parse(data.toString("utf-8"));
}

function writeJson(object, fileName) {
  fs.writeFileSync(fileName, JSON.stringify(object));
}

function getEnglishDex(pokemonDexExtryJson) {
  return pokemonDexExtryJson.flavor_text_entries.findIndex(function (item) {
    return item.language.name == "en"
  })
}



//Router for Home Site
router.get("/", function (req, res) {
  const pokemon = getAllPokemon();
  console.log(req.query.pokemon + " a")
  const param = req.query.pokemon
  console.log(param)

  if (req.query.pokemon) {
    res.locals.pokemon = pokemon;

    function findPokemonIndexByDex(pokemon) {
      return pokemon.findIndex(function (item) {
        return item.dexNumber == req.query.pokemon
      })
    }
    const pokemonIndex = findPokemonIndexByDex(pokemon)


    res.locals.openingPokemonImage = pokemon[pokemonIndex].imageUrl;
    res.locals.openingPokemonNumber = pokemon[pokemonIndex].dexNumber;
    res.locals.openingPokemonName = pokemon[pokemonIndex].name;
    res.locals.openingPokemonTypes = pokemon[pokemonIndex].types;
    res.locals.openingPokemonAbout = pokemon[pokemonIndex].dexEntry;
  } else {
    res.locals.pokemon = pokemon;
    res.locals.openingPokemonImage = pokemon[57].imageUrl;
    res.locals.openingPokemonNumber = pokemon[57].dexNumber;
    res.locals.openingPokemonName = pokemon[57].name;
    res.locals.openingPokemonTypes = pokemon[57].types;
    res.locals.openingPokemonAbout = pokemon[57].dexEntry;
    // console.log(a + ' Growlithe should be the required pokemon')
  }

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

  //If there is no dexEntry (at least pokemon 1009) then prevent web crash by advising no entry available
  let dexEntry;
  if (pokemonDexExtryJson.flavor_text_entries[dexEntryIndex] == undefined) {
    dexEntry = "There is no dex entry for this pokemon available"
  } else {
    dexEntry = pokemonDexExtryJson.flavor_text_entries[dexEntryIndex].flavor_text
  }

  const requiredPokemonJson = {
    dexNumber: dexNumber,
    name: `${pokemonJson.species.name}`,
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dexNumber}.png`,
    smallImageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`,
    types: `${types}`,
    dexEntry: dexEntry
  }

  const pokemonJsonFile = readJson("./src/json/pokemon.json")
  const stringedDatabase = JSON.stringify(pokemonJsonFile)

  if (stringedDatabase.includes(dexNumber)) {
    console.log("This pokemon is already in the list")

  } else {
    capitaliseFirstLetter(requiredPokemonJson)
    await pokemonJsonFile.push(requiredPokemonJson)
    writeJson(pokemonJsonFile, "./src/json/pokemon.json")
  }

  function capitaliseFirstLetter(item) {
    const value = item.name[0].toUpperCase()
    const updatedValue = value + item.name.slice(1);
    item.name = updatedValue
  }

  res.redirect(`/?pokemon=${dexNumber}`)
})


module.exports = router;
