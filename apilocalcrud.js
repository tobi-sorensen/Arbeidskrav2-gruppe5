// Felles API, LocalStorage, CRUD

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
    const response = await axios.post(apiUrl, newItem);
    console.log(`Ny ${key}-oppføring er lagt til!`);
    const updated = [...getFromLocalStorage(key), response.data];
    saveToLocalStorage(key, updated);
    return response.data;
  } catch (error) {
    console.error(`Klarte ikke å lagre ${key}. Noe gikk galt.`);
  }
}

// Redigerer et element
async function editItem(key, id, updatedItem, apiUrl) {
  try{
    await axios.put(`${apiUrl}/${id}`, updatedItem);
    console.log(`${key} ble redigert og oppdatert.`);
    const updated = getFromLocalStorage(key).map((item) =>
      item._id === id ? updatedItem : item
    );
    saveToLocalStorage(key, updated);
  } catch (error) {
    console.error(`Redigering av ${key} feilet.`);
  }
}
 

// Sletter et element basert på navn
async function deleteItem(key, id, apiUrl) {
  try {
    await axios.delete(`${apiUrl}/${id}`);
    console.log(`${key} er slettet.`);
    const filtered = getFromLocalStorage(key).filter((item) => item._id !== id);
    saveToLocalStorage(key, filtered);
  } catch (error) {
    console.error(`Klarte ikke å slette ${key}. Noe gikk galt.`);
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
