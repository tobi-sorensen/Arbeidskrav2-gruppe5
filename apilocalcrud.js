//  Henter alle data fra API swapi.info 
async function fetchAllData(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Feil ved henting: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Ugyldig respons – forventet en array.");
    }

    return data;
  } catch (error) {
    console.error("Klarte ikke hente data fra API. Sjekk tilkoblingen.", error);
    return [];
  }
}

// LocalStorage funksjoner 
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

//  Opprett ny karakter eller kjøretøy 
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
    console.log(`Ny ${key}-oppføring lagt til!`);

    const updated = [...getFromLocalStorage(key), data];
    saveToLocalStorage(key, updated);
    return data;
  } catch (error) {
    console.error(`Klarte ikke opprette ${key}:`, error);
  }
}

//  Redigere eksisterende element 
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

    console.log(`${key} oppdatert.`);

    const updated = getFromLocalStorage(key).map((item) =>
      item._id === id ? updatedItem : item
    );

    saveToLocalStorage(key, updated);
  } catch (error) {
    console.error(`Redigering av ${key} feilet:`, error);
  }
}

// Slette eksisterended element 
async function deleteItem(key, id, apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP-feil! Status: ${response.status}`);
    }

    console.log(`${key} slettet.`);

    const filtered = getFromLocalStorage(key).filter((item) => item._id !== id);
    saveToLocalStorage(key, filtered);
  } catch (error) {
    console.error(`Sletting av ${key} feilet:`, error);
  }
}

//  Karakter: hent og lagre species 
async function fetchAllSpecies() {
  const speciesList = await fetchAllData("https://swapi.info/api/species");
  const speciesMap = {};

  speciesList.forEach((species) => {
    const url = species.url.endsWith("/") ? species.url.slice(0, -1) : species.url;
    speciesMap[url] = species.name;
  });

  saveToLocalStorage("species", speciesMap);
  return speciesMap;
}

//  Eksporter globale funksjoner 
window.fetchAllData = fetchAllData;
window.saveToLocalStorage = saveToLocalStorage;
window.getFromLocalStorage = getFromLocalStorage;
window.createItem = createItem;
window.deleteItem = deleteItem;
window.editItem = editItem;
window.fetchAllSpecies = fetchAllSpecies;
