// Felles API, LocalStorage, CRUD

// Henter data fra SWAPI
async function fetchAllData(apiUrl) {
  let results = [];
  let nextUrl = apiUrl;

  try {
    while (nextUrl) {
      const response = await fetch(nextUrl);

      // Sjekk om responsen er OK
      if (!response.ok) {
        throw new Error(`Feil ved henting: ${response.status}`);
      }

      // Hent JSON-data fra responsen
      const data = await response.json();

      // Valider at responsen inneholder gyldige data
      if (!data || !Array.isArray(data.results)) {
        throw new Error("Ugyldig respons fra API.");
      }

      // Oppdater resultater og neste side-URL
      results = results.concat(data.results);
      nextUrl = data.next; // Neste side
    }
  } catch (error) {
    // Feilhåndtering
    console.error("Klarte ikke hente data fra API. Sjekk tilkoblingen.", error);
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

// Oppretter et nytt element (brukes for karakter og kjøretøy)
async function createItem(key, newItem, apiUrl) {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (!response.ok) {
      throw new Error(`HTTP-feil! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Ny ${key}-oppføring er lagt til!`);
    const updated = [...getFromLocalStorage(key), data];
    saveToLocalStorage(key, updated);
    return data;
  } catch (error) {
    console.error(`Klarte ikke å lagre ${key}. Feil:`, error);
  }
}

// Redigerer et element
async function editItem(key, id, updatedItem, apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    });
    if (!response.ok) {
      throw new Error(`HTTP-feil! Status: ${response.status}`);
    }
    console.log(`${key} ble redigert og oppdatert.`);
    const updated = getFromLocalStorage(key).map((item) =>
      item._id === id ? updatedItem : item
    );
    saveToLocalStorage(key, updated);
  } catch (error) {
    console.error(`Redigering av ${key} feilet. Feil:`, error);
  }
}
 

// Sletter et element basert på navn
async function deleteItem(key, id, apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP-feil! Status: ${response.status}`);
    }
    console.log(`${key} er slettet.`);
    const filtered = getFromLocalStorage(key).filter((item) => item._id !== id);
    saveToLocalStorage(key, filtered);
  } catch (error) {
    console.error(`Klarte ikke å slette ${key}. Feil:`, error);
  }
}

// Kun for karakterer: henter og lagrer species
async function fetchAllSpecies() {
  const speciesList = await fetchAllData("https://swapi.info/api/species/");
  const speciesMap = {};
  speciesList.forEach((species) => {
    speciesMap[species.url] = species.name;
  });
  saveToLocalStorage("species", speciesMap);
  return speciesMap;
}

// Gjør funksjonene globale slik at characters.js får tilgang
window.fetchAllData = fetchAllData;
window.saveToLocalStorage = saveToLocalStorage;
window.getFromLocalStorage = getFromLocalStorage;
window.createItem = createItem;
window.deleteItem = deleteItem;
window.editItem = editItem;
window.fetchAllSpecies = fetchAllSpecies;
=======
// Felles API, LocalStorage, CRUD
// API-nøkler og URL-er
const API_KEYS = {
  character: "tR1Qe84J9e05tUfCBgJyOmIe_A3k7vvDHubu0ZqyulccvGsXtQ",
  vehicles: "dHuEQ2iFrA4GCXpAInw8QO3OdsEFCqWH2sjpeIKwQ1dCj_J3zA",
  credits: "bxNWo4h4E4YbG-7Ovvc4igwmC27tdw4duANPUYdF6ztTEQWimQ" 
};

const API_URLS = {
  character: "https://crudapi.co.uk/api/v1/character",
  vehicles: "https://crudapi.co.uk/api/v1/vehicles",
  credits: "https://crudapi.co.uk/api/v1/credits"
};

// Henter data fra SWAPI
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

async function fetchAllSpecies() {
  const speciesList = await fetchAllData("https://swapi.dev/api/species/");
  const speciesMap = {};
  speciesList.forEach((species) => {
    speciesMap[species.url] = species.name;
  });
  saveToLocalStorageAndApi("species", speciesMap);
  return speciesMap;
}

async function saveToLocalStorageAndApi(key, data, apiKey, apiUrl) {
  try {
    localStorage.setItem(key, JSON.stringify(data));

    if (apiKey && apiUrl) {
      const response = await axios.post(apiUrl, data, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      console.log(`Vellykket lagring av ${key}:`, response.status);
      return response.data;
    }
  } catch (error) {
    console.error(`Feil ved lagring av ${key}:`, error);
  }
}

function getFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

async function createItem(key, newItem, apiKeyType) {
  const items = getFromLocalStorage(key);
  items.push(newItem);
  
  await saveToLocalStorageAndApi(
    key, 
    items, 
    API_KEYS[apiKeyType], 
    API_URLS[apiKeyType]
  );
  
  return items;
}

async function deleteItem(key, name, apiKeyType) {
  let items = getFromLocalStorage(key);
  items = items.filter((item) => item.name !== name);
  
  await saveToLocalStorageAndApi(
    key, 
    items, 
    API_KEYS[apiKeyType], 
    API_URLS[apiKeyType]
  );
  
  return items;
}

async function editItem(key, name, updatedFields, apiKeyType) {
  let items = getFromLocalStorage(key);
  const index = items.findIndex((item) => item.name === name);
  
  if (index !== -1) {
    items[index] = { ...items[index], ...updatedFields };
    
    await saveToLocalStorageAndApi(
      key, 
      items, 
      API_KEYS[apiKeyType], 
      API_URLS[apiKeyType]
    );
  }
  
  return items;
}

async function updateCredits(amount, apiKeyType = 'credits') {
  let credits = parseInt(localStorage.getItem('credits')) || 0;
  credits += amount;
  
  localStorage.setItem('credits', credits);
  
  await saveToLocalStorageAndApi(
    'credits', 
    [{ amount: credits }], 
    API_KEYS[apiKeyType], 
    API_URLS[apiKeyType]
  );
  
  return credits;
}
window.fetchAllData = fetchAllData;
window.saveToLocalStorageAndApi = saveToLocalStorageAndApi;
window.getFromLocalStorage = getFromLocalStorage;
window.createItem = createItem;
window.deleteItem = deleteItem;
window.editItem = editItem;
window.updateCredits = updateCredits;
