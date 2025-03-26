// Egen fil for eksportering til jest

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

// Lagrer data i LocalStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Leser data fra LocalStorage
function getFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Oppretter et nytt element (brukes for karakter og kjøretøy)
function createItem(key, newItem) {
  const items = getFromLocalStorage(key);
  items.push(newItem);
  saveToLocalStorage(key, items);
  return items;
}

// Sletter et element basert på navn
function deleteItem(key, name) {
  let items = getFromLocalStorage(key);
  items = items.filter((item) => item.name !== name);
  saveToLocalStorage(key, items);
  return items;
}

// Redigerer et element
function editItem(key, name, updatedFields) {
  let items = getFromLocalStorage(key);
  const index = items.findIndex((item) => item.name === name);
  if (index !== -1) {
    items[index] = { ...items[index], ...updatedFields };
    saveToLocalStorage(key, items);
  }
  return items;
}

// Kun for karakterer: henter og lagrer species
async function fetchAllSpecies() {
  const speciesList = await fetchAllData("https://swapi.dev/api/species/");
  const speciesMap = {};
  speciesList.forEach((species) => {
    speciesMap[species.url] = species.name;
  });
  saveToLocalStorage("species", speciesMap);
  return speciesMap;
}

// Eksport for testing
export {
  fetchAllData,
  saveToLocalStorage,
  getFromLocalStorage,
  createItem,
  deleteItem,
  editItem,
  fetchAllSpecies,
};
