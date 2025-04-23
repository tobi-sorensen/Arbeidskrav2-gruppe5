// Base crudcrud-url
const API_BASE_URL = "https://crudcrud.com/api/c60ac33f645c4b0dafa4e94a7c6fc12b";

const API_URLS = {
  character: `${API_BASE_URL}/characters`,
  vehicle: `${API_BASE_URL}/vehicles`,
  credits: `${API_BASE_URL}/credits`,
};

// Lager nytt objekt i crudcrud og localStorage
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
    console.log(`Ny ${key}-oppføring lagt til:`, data);

    const updated = [...getFromLocalStorage(key), data];
    saveToLocalStorage(key, updated);
    return data;
  } catch (error) {
    console.error(`Klarte ikke opprette ${key}:`, error);
  }
}

// Redigerer eksisterende element
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

// Sletter eksisterende element
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

// Henter alle data fra SWAPI (må være array)
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

// Leser fra localStorage
function getFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Skriver til localStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Henter og lagrer species fra SWAPI
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
