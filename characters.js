console.log("characters.js er lastet!");

// Sideoppsett med antall kort per side
let currentPage = 1;
const itemsPerPage = 6;

// Fjerner sensitivitet til store/små bokstaver når man lager karakterer
function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Henter filmtitler fra SWAPI og lagrer i localStorage
async function fetchAllFilms() {
  const films = await fetchAllData("https://swapi.info/api/films");
  const filmMap = {};
  films.forEach((film) => {
    const url = film.url.endsWith("/") ? film.url.slice(0, -1) : film.url;
    filmMap[url] = film.title;
  });
  saveToLocalStorage("films", filmMap);
  return filmMap;
}

// Setter opp filtreringsmenyen med kun SWAPI-species
function populateSpeciesDropdownFromMap(speciesMap) {
  const select = document.getElementById("speciesFilter");
  select.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Alle";
  select.appendChild(allOption);

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

  //  // Legger til "Unknown" hvis noen karakterer mangler species
  const characters = getFromLocalStorage("characters");
  if (characters.some((char) => char.species === "Unknown")) {
    const unknownOption = document.createElement("option");
    unknownOption.value = "Unknown";
    unknownOption.textContent = "Unknown";
    select.appendChild(unknownOption);
  }

  select.addEventListener("change", () => {
    currentPage = 1;
    filterBySpecies(select.value);
  });
}

// Kjøres når siden lastes. Sjekker og henter species, filmer og karakterer.
async function initCharacters() {
  let characters = getFromLocalStorage("characters") || [];
  let speciesMap = getFromLocalStorage("species") || {};
  let filmMap = getFromLocalStorage("films") || {};

  if (!Object.keys(speciesMap).length) {
    speciesMap = await fetchAllSpecies();
  }

  if (!Object.keys(filmMap).length) {
    filmMap = await fetchAllFilms();
  }

  if (!characters.length) {
    const apiData = await fetchAllData("https://swapi.info/api/people");

    characters = apiData.map((person) => {
      let resolvedSpecies;
      if (person.name === "R4-P17") {
        resolvedSpecies = "Droid";
      } else {
        resolvedSpecies = speciesMap[person.species[0]] || "Unknown";
        if (resolvedSpecies === "Unknown" && person.name !== "Sly Moore") {
          resolvedSpecies = "Human";
        }
      }

      // Filmtitler
      const filmTitles = person.films.map((url) => {
        const cleanUrl = url.endsWith("/") ? url.slice(0, -1) : url;
        return filmMap[cleanUrl] || "Ukjent film";
      });

      return {
        name: person.name,
        birthYear: person.birth_year,
        species: capitalizeFirstLetter(resolvedSpecies),
        films: filmTitles,
        _id: crypto.randomUUID(),
      };
    });

    saveToLocalStorage("characters", characters);
  }

  populateSpeciesDropdownFromMap(speciesMap);
  displayCharacters(characters);
}

// Prøver å lage karakter i crudcrud, og hvis det feiler lagres det lokalt
function safeCreateCharacter(character) {
  let characters = getFromLocalStorage("characters") || [];

  return fetch(API_URLS.character, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(character),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("API-oppretting feilet");
      }
      return response.json();
    })
    .then((createdCharacter) => {
      characters.push(createdCharacter);
      return createdCharacter;
    })
    .catch((e) => {
      console.warn("Oppretting via API feilet, lagrer lokalt:", e);
      characters.push(character);
      return character;
    })
    .finally(() => {
      saveToLocalStorage("characters", characters);
      displayCharacters(characters);
    });
}

// Lag karakter
function createCharacter() {
  const name = document.getElementById("name").value.trim();
  const birthYear = document.getElementById("birthYear").value.trim();
  const speciesInput = document.getElementById("species").value.trim();
  const species = capitalizeFirstLetter(speciesInput);

  if (!name || !birthYear || !species) {
    alert("Fyll ut alle feltene!");
    return;
  }

  const characters = getFromLocalStorage("characters") || [];
  const allowedSpecies = Object.values(
    getFromLocalStorage("species") || {}
  ).map(capitalizeFirstLetter);

  if (!allowedSpecies.includes(species)) {
    alert("Species må være fra Star Wars-universet!");
    return;
  }

  const nameExists = characters.some(
    (c) => c?.name?.toLowerCase?.() === name.toLowerCase()
  );
  if (nameExists) {
    alert("Denne karakteren finnes allerede!");
    return;
  }

  const newCharacter = { name, birthYear, species, films: [] };

  safeCreateCharacter(newCharacter).then((savedCharacter) => {
    const characters = getFromLocalStorage("characters") || [];
    const updated = [
      ...characters.filter((c) => c._id !== savedCharacter._id),
      savedCharacter,
    ];
    saveToLocalStorage("characters", updated);
    const selectedSpecies = document.getElementById("speciesFilter").value;
    filterBySpecies(selectedSpecies);

    alert("Karakter ble opprettet!");
    document.getElementById("characterForm").reset();
    console.log("Opprettet karakter:", savedCharacter);
  
  });
}

// Prøver å redigere karakter i crudcrud, og hvis det feiler oppdateres kun localStorage
function safeEditCharacter(id, updatedCharacter) {
  fetch(`${API_URLS.character}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedCharacter),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("API-redigering feilet");
      }
    })
    .catch((e) => {
      console.warn("Redigering via API feilet, oppdaterer kun lokalt:", e);
    })
    .finally(() => {
      const characters = getFromLocalStorage("characters");
      const updatedList = characters.map((c) =>
        c._id === id ? updatedCharacter : c
      );
      saveToLocalStorage("characters", updatedList);
      const selectedSpecies = document.getElementById("speciesFilter").value;
      filterBySpecies(selectedSpecies);
      alert("Karakter ble redigert!");
    });
}

// Rediger karakter
function editCharacter(id) {
  const characters = getFromLocalStorage("characters");
  const character = characters.find((c) => c._id === id);

  const newName = prompt("Nytt navn:", character.name);
  const newSpeciesInput = prompt("Ny species:", character.species);

  if (!newName || !newSpeciesInput) {
    alert("Redigering avbrutt.");
    return;
  }

  const newSpecies = capitalizeFirstLetter(newSpeciesInput);
  const allowedSpecies = Object.values(getFromLocalStorage("species")).map(
    capitalizeFirstLetter
  );

  if (!allowedSpecies.includes(newSpecies)) {
    alert("Ugyldig species! Velg en art som finnes i Star Wars-universet.");
    return;
  }

  const updatedCharacter = {
    ...character,
    name: newName.trim(),
    species: newSpecies,
  };

  safeEditCharacter(id, updatedCharacter);
}

// Slett karakter
function safeDeleteCharacter(id) {
  // Henter uansett fra localStorage
  let characters = getFromLocalStorage("characters");

  fetch(`${API_URLS.character}/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("API-sletting feilet");
      }
      // Logg hvis API-sletting lykkes
      console.log("Slettet via API:", id);
    })
    .catch((e) => {
      console.warn("Sletting via API feilet, fjerner lokalt:", e);
    })
    .finally(() => {
      // Fjern lokalt uansett
      characters = characters.filter((c) => c._id !== id);
      saveToLocalStorage("characters", characters);
      const selectedSpecies = document.getElementById("speciesFilter").value;
      // oppdater visning basert på valgt species i filter
      filterBySpecies(selectedSpecies);
      alert("Karakter slettet!");
    });
}

// Lager kort
function createCharacterCard(character) {
  const card = document.createElement("div");
  card.classList.add("characterCard");

  const speciesClass = character.species
    .toLowerCase()
    // Mellomrom til bindestrek
    .replace(/\s/g, "-")
    // Fjerner spesialtegn som ' og :
    .replace(/[^a-z0-9-]/g, "");

  card.classList.add(speciesClass);

  card.id = `card-${character._id}`;

  const cardText = document.createElement("div");
  cardText.classList.add("cardText");

  const nameEl = document.createElement("h3");
  nameEl.textContent = character.name;

  const birthYearEl = document.createElement("p");
  birthYearEl.textContent = `Fødselsår: ${character.birthYear}`;

  const speciesEl = document.createElement("p");
  speciesEl.textContent = `Species: ${character.species}`;

  cardText.appendChild(nameEl);
  cardText.appendChild(birthYearEl);
  cardText.appendChild(speciesEl);

  if (character.films?.length) {
    const filmLabel = document.createElement("p");
    filmLabel.textContent = "Filmer:";
    cardText.appendChild(filmLabel);

    const filmTags = document.createElement("div");
    filmTags.classList.add("filmTags");
    character.films.forEach((film) => {
      const tag = document.createElement("span");
      tag.classList.add("filmTag");
      tag.textContent = film;
      filmTags.appendChild(tag);
    });
    cardText.appendChild(filmTags);
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("cardButtons"); 

  const editBtn = document.createElement("button");
  editBtn.textContent = "Rediger";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Slett";

  buttonContainer.appendChild(editBtn);
  buttonContainer.appendChild(deleteBtn);
  cardText.appendChild(buttonContainer);
  card.appendChild(cardText);

  editBtn.addEventListener("click", () => editCharacter(character._id));
  deleteBtn.addEventListener("click", () => safeDeleteCharacter(character._id));

  return card;
}

// Viser karakterkort
function displayCharacters(characters) {
  const container = document.getElementById("charactersContainer");
  container.innerHTML = "";
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = characters.slice(start, start + itemsPerPage);
  paginated.forEach((char) => container.appendChild(createCharacterCard(char)));
  renderPagination(characters.length);
}

// Side-navigasjon
function renderPagination(totalItems) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Forrige";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => changePage(-1));

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Neste";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => changePage(1));

  const pageText = document.createElement("span");
  pageText.textContent = `Side ${currentPage} av ${totalPages}`;

  container.appendChild(prevBtn);
  container.appendChild(pageText);
  container.appendChild(nextBtn);
}

function changePage(direction) {
  currentPage += direction;
  const selected = document.getElementById("speciesFilter").value;
  filterBySpecies(selected);
}

// Filtrerer karakterer basert på valgt species
function filterBySpecies(selectedSpecies) {
  let characters = getFromLocalStorage("characters") || [];
  if (selectedSpecies !== "all") {
    characters = characters.filter((c) => c.species === selectedSpecies);
  }
  displayCharacters(characters);
}

// Credits
if (!localStorage.getItem("credits")) {
  localStorage.setItem("credits", 0);
}

// Oppdaterer visningen av credits
function updateCredits() {
  const display = document.getElementById("creditDisplay");
  const credits = parseInt(localStorage.getItem("credits")) || 0;
  if (display) display.textContent = `Credits: ${credits}`;
}

// Starter programmet når nettsiden er klar
document.addEventListener("DOMContentLoaded", () => {
  updateCredits();
  initCharacters();
  document
    .getElementById("createCharacterBtn")
    .addEventListener("click", createCharacter);
});
