console.log("characters.js er lastet!");

// Side oppsett med antall kort per side
let currentPage = 1;
const itemsPerPage = 6;


// Fjerner sensitivitet til store/små bokstaver når man lager karakter
function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

//  Henter filmdata fra API og lagrer i localstorage
async function fetchAllFilms() {
  const response = await fetch("https://swapi.info/api/films/"); // Endret til swapi.info for å unngå mer problematikk da swapi.dev er nede
  const data = await response.json();
  const map = {};
  data.results.forEach((film) => {
    const url = film.url.endsWith("/") ? film.url.slice(0, -1) : film.url;
    map[url] = film.title;
  });
  saveToLocalStorageAndApi("films", map);
  console.log("Filmtitler lagret:", map);
  return map;
}

// Meny for filterering av species
function populateSpeciesDropdownFromMap(speciesMap) {
  const select = document.getElementById("speciesFilter");
  select.innerHTML = '<option value="all">Alle</option>';
  const added = new Set();
  
  Object.values(speciesMap).forEach((speciesName) => {
    const normalized = capitalizeFirstLetter(speciesName);
    if (!added.has(normalized)) {
      const option = document.createElement("option");
      option.value = normalized;
      option.textContent = normalized;
      select.appendChild(option);
      added.add(normalized);
    }
  });

  // Legg til "Unknown"
  const characters = getFromLocalStorage("characters");
  if (characters.some((char) => char.species === "Unknown")) {
    const option = document.createElement("option");
    option.value = "Unknown";
    option.textContent = "Unknown";
    select.appendChild(option);
  }
  select.addEventListener("change", () => {
    currentPage = 1;
    filterBySpecies(select.value);
  });
}
// Henter karakterer fra API og lagrer i LocalStorage
async function initCharacters() {
  let characters = getFromLocalStorage("characters");
  let speciesMap = getFromLocalStorage("species");
  let filmMap = getFromLocalStorage("films");

  if (!speciesMap || Object.keys(speciesMap).length === 0) {
    speciesMap = await fetchAllSpecies();
  }
  if (!filmMap || Object.keys(filmMap).length === 0) {
    filmMap = await fetchAllFilms();
  }

  if (characters.length === 0) {
    const apiData = await fetchAllData("https://swapi.info/api/people/");
    characters = apiData.map((person) => {
      // Overstyrer filtrerings problematikk fra API
      let resolvedSpecies;

      if (person.name === "R4-P17") {
        resolvedSpecies = "Droid";
      } else {
        resolvedSpecies = speciesMap[person.species[0]] || "Unknown";

        if (resolvedSpecies === "Unknown" && person.name !== "Sly Moore") {
          resolvedSpecies = "Human";
        }
      }

      //Film titler
      const filmTitles = person.films.map((url) => {
        const cleanUrl = url.endsWith("/") ? url.slice(0, -1) : url;
        return filmMap[cleanUrl] || "Ukjent film";
      });

      return {
        name: person.name,
        birthYear: person.birth_year,
        species: capitalizeFirstLetter(resolvedSpecies),
        films: filmTitles,
      };
    });
    saveToLocalStorageAndApi("characters", characters);
  }

  populateSpeciesDropdownFromMap(speciesMap);
  displayCharacters(characters);
}
// Lager ny karakter
function createCharacter() {
  const name = document.getElementById("name").value.trim();
  const birthYear = document.getElementById("birthYear").value.trim();
  const speciesInput = document.getElementById("species").value.trim();
  const species = capitalizeFirstLetter(speciesInput);

  if (!name || !birthYear || !species) {
    alert("Fyll ut alle feltene!");
    return;
  }

  const characters = getFromLocalStorage("characters");
  if (characters.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    alert("Denne karakteren finnes allerede!");
    return;
  }

  const newCharacter = { name, birthYear, species, films: [] };
  createItem("characters", newCharacter, API_URLS.character).then(() => {
    // Sender til API og oppdattere localStorage med _id
    document.getElementById("CharacterForm").reset();
    displayCharacters(getFromLocalStorage("characters"));
  });
}

// Redigerer karakter
function editCharacter(id) {
  const characters = getFromLocalStorage("characters");
  const character = characters.find((c) => c._id === id);
  const newSpeciesInput = prompt("Endre species til:", character.species);

  if (newSpeciesInput) {
    const newSpecies = capitalizeFirstLetter(newSpeciesInput);
    const updatedCharacter = { ...character, species: newSpecies };

    editItem("characters", id, updatedCharacter, API_URLS.character).then(
      () => {
        displayCharacters(getFromLocalStorage("characters"));
      }
    );
  }
}

// Sletter karakter
function deleteCharacter(id) {
  deleteItem("characters", id, API_URLS.character).then(() => {
    displayCharacters(getFromLocalStorage("characters"));
  });
}

function createCharacterCard(character) {
  const card = document.createElement("div");
  card.classList.add("characterCard");
  card.style.backgroundColor = getSpeciesColor(character.species);

  const filmList = character.films?.length
    ? `<div class="filmTags">${character.films
        .map((f) => `<span class="filmTag">${f}</span>`)
        .join("")}</div>`
    : "<p><em>Ingen filmer</em></p>";

  card.innerHTML = `
   <div class="cardText">
    <h3>${character.name}</h3>
    <p>Fødselsår: ${character.birthYear}</p>
    <p>Species: ${character.species}</p>
    <p>Filmer:</p>
    ${filmList}
    <button onclick="editCharacter('${character._id}')">Rediger</button>
    <button onclick="deleteCharacter('${character._id}')">Slett</button>
  `;
  return card;
}

function displayCharacters(characters) {
  const container = document.getElementById("charactersContainer");
  container.innerHTML = "";
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedCharacters = characters.slice(start, start + itemsPerPage);
  paginatedCharacters.forEach((character) => {
    container.appendChild(createCharacterCard(character));
  });
  renderPagination(characters.length);
}
// Side navigering
function renderPagination(totalItems) {
  const container = document.getElementById("pagination");
  if (!container) return;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  container.innerHTML = `
    <button ${
      currentPage === 1 ? "disabled" : ""
    } onclick="changePage(-1)">◀ Forrige</button>
    <span>Side ${currentPage} av ${totalPages}</span>
    <button ${
      currentPage === totalPages ? "disabled" : ""
    } onclick="changePage(1)">Neste ▶</button>
  `;
}

function changePage(direction) {
  currentPage += direction;
  const selected = document.getElementById("speciesFilter").value;
  filterBySpecies(selected);
}
// Filtrerer karakterer basert på species
function filterBySpecies(selectedSpecies) {
  let characters = getFromLocalStorage("characters");
  if (selectedSpecies !== "all") {
    characters = characters.filter((c) => c.species === selectedSpecies);
  }
  displayCharacters(characters);
}
// Credits
if (!localStorage.getItem("credits")) {
  localStorage.setItem("credits", 0);
}

function updateCredits() {
  const creditDisplay = document.getElementById("creditDisplay");
  const credits = parseInt(localStorage.getItem("credits")) || 0;
  if (creditDisplay) creditDisplay.textContent = `Credits: ${credits}`;
}
// Sikrer at skriptet starter når siden er ferdig å laste
document.addEventListener("DOMContentLoaded", updateCredits);
document.addEventListener("DOMContentLoaded", initCharacters);
