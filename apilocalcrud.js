// Felles API, LocalStorage, CRUD
const axios = require("axios");
// Henter ALL data fra SWAPI med 
async function fetchAllData(apiUrl) {
    let results = [];
    let nextUrl = apiUrl;
  
    try {
      while (nextUrl) {
        const response = await fetch(nextUrl);
        if (!response.ok) {
          throw new Error(`Feil ved henting: ${response.status}`);
        }
        const data = await response.json();
        results = results.concat(data.results);
        nextUrl = data.next; // Neste side
      }
    } catch (error) {
      console.error("API-feil:", error);
    }
  
    return results;
  }
  
  // Lagrer data i LocalStorage
  function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  // Leser data fra LocalStorage
  function getFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

// CRUD for character
const apiKeyCharacter = "tR1Qe84J9e05tUfCBgJyOmIe_A3k7vvDHubu0ZqyulccvGsXtQ"
const apiUrlCharacter = "https://crudapi.co.uk/api/v1/character"

const newCharacter = [
  {
    name: "Luke Skywalker",
    birthYear: "19 bby",
    movies: "456789",
    species: "Human"
  },
];

async function addCharacter(characterData, apiKeyCharacter) {
  try {
    const response = await axios.post(apiUrlCharacter, characterData, {
      headers: { Authorization: `Bearer ${apiKeyCharacter}`}
    });
    console.log("Ny karakter lagt til", response.data);
  } catch (error) {
    console.error("Klarte ikke å legge til karkater", error);
  }
};

addCharacter(newCharacter, apiKeyCharacter);

// CRUD for vehicles
const apiKeyVehicles = "dHuEQ2iFrA4GCXpAInw8QO3OdsEFCqWH2sjpeIKwQ1dCj_J3zA"
const apiUrlVehicles = "https://crudapi.co.uk/api/v1/vehicles"

const newVehicle = [
  {
    name: "Sand crawler",
    model: "Digger crawler",
    cargoCapacity: "50000",
    cost: "150000"
  }
]

async function addVehicle(vehicleData, apiKeyVehicles) {
  try {
    const response = await axios.post(apiUrlVehicles, vehicleData, {
      headers: {Authorization: `Bearer ${apiKeyVehicles}`}
    });
    console.log("Nytt kjøretøy lagt til", response.data);
  } catch (error) {
    console.error("Klarte ikke å legge til kjøretøy", error)
  }
}

addVehicle(newVehicle, apiKeyVehicles);