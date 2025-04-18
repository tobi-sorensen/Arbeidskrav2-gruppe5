let currentVehiclePage = 1;
const vehiclesPerPage = 6;
let allVehicles = [];

async function initVehicles() {
  let vehicles = getFromLocalStorage('vehicles');
  
  vehicles = Array.isArray(vehicles) ? vehicles : [];
  
  if (vehicles.length === 0) {
    try {
      const apiVehicles = await fetchAllData("https://swapi.dev/api/vehicles/");
      
      vehicles = apiVehicles.map(vehicle => ({
        name: vehicle.name,
        model: vehicle.model,
        cargoCapacity: vehicle.cargo_capacity,
        cost: vehicle.cost_in_credits === 'unknown' ? 0 : parseInt(vehicle.cost_in_credits),
      }));
      
      await saveToLocalStorageAndApi('vehicles', vehicles, API_KEYS.vehicles, API_URLS.vehicles);
    } catch (error) {
      console.error("Kunne ikke hente kjøretøy:", error);
      vehicles = [];
    }
  }
  
  allVehicles = Array.isArray(vehicles) ? vehicles : [];
  
  displayVehicles();
  displayOwnedVehicles();
  updateCredits();
}

function createVehicleCard(vehicle) {
  const card = document.createElement("div");
  card.classList.add("vehicleCard");
  
  const currentCredits = parseInt(localStorage.getItem('credits')) || 0;
  const canAfford = currentCredits >= vehicle.cost;
  
  card.innerHTML = `
    <div class="cardText">
      <h3>${vehicle.name}</h3>
      <p>Model: ${vehicle.model}</p>
      <p>Cargo Capacity: ${vehicle.cargoCapacity}</p>
      <p>Cost: ${vehicle.cost} credits</p>
      
      <button 
        onclick="buyVehicle('${vehicle.name}')" 
        ${!canAfford ? 'disabled' : ''}
      >
        ${canAfford ? 'Kjøp' : 'Ikke råd'}
      </button>
      <button onclick="deleteVehicle('${vehicle.name}')">Slett</button>
    </div>
  `;
  
  return card;
}

function deleteVehicle(vehicleName) {
  deleteItem('vehicles', vehicleName, 'vehicles');
  displayVehicles();
}

function displayOwnedVehicles() {
  const container = document.getElementById('ownedVehiclesContainer');
  container.innerHTML = '';
  
  const ownedVehicles = getFromLocalStorage('ownedVehicles');
  
  ownedVehicles.forEach(vehicle => {
    const card = createOwnedVehicleCard(vehicle);
    container.appendChild(card);
  });
}

function displayVehicles() {
    const container = document.getElementById('vehiclesContainer');
    
    if (!container) {
      console.error('Vehicles container not found');
      return;
    }
    
    container.innerHTML = '';

    const startIndex = (currentVehiclePage - 1) * vehiclesPerPage;
    const endIndex = startIndex + vehiclesPerPage;

    const paginatedVehicles = allVehicles.slice(startIndex, endIndex);

    paginatedVehicles.forEach(vehicle => {
      const card = createVehicleCard(vehicle);
      container.appendChild(card);
    });

    updateVehiclePagination();
  }

  async function buyVehicle(vehicleName) {
    const vehicle = allVehicles.find(v => v.name === vehicleName);
    const ownedVehicles = getFromLocalStorage('ownedVehicles');
  
    if (ownedVehicles.some(v => v.name === vehicleName)) {
      alert('Du eier allerede dette kjøretøyet!');
      return;
    }
  
    let currentCredits = parseInt(localStorage.getItem('credits')) || 0;
    if (currentCredits < vehicle.cost) {
      alert('Ikke nok credits!');
      return;
    }
  
    await updateCredits(-vehicle.cost);
  
    await createItem('ownedVehicles', {...vehicle, purchasePrice: vehicle.cost}, 'vehicles');
  
    displayOwnedVehicles();
  }

function displayOwnedVehicles() {
  const container = document.getElementById('ownedVehiclesContainer');
  container.innerHTML = '';
  
  const ownedVehicles = getFromLocalStorage('ownedVehicles');
  
  ownedVehicles.forEach(vehicle => {
    const card = createOwnedVehicleCard(vehicle);
    container.appendChild(card);
  });
}

function createOwnedVehicleCard(vehicle) {
  const card = document.createElement('div');
  card.classList.add('vehicleCard');
  
  const sellPrice = Math.round(vehicle.purchasePrice * 0.8);
  
  card.innerHTML =`
  <div class="cardText">
      <h3>${vehicle.name}</h3>
      <p>Model: ${vehicle.model}</p>
      <p>Kjøpspris: ${vehicle.purchasePrice} credits</p>
      <p>Salgspris: ${sellPrice} credits</p>
      <button onclick="sellVehicle('${vehicle.name}')">Selg</button>
    </div>
  `
;
  return card;
}

async function sellVehicle(vehicleName) {
    const ownedVehicles = getFromLocalStorage('ownedVehicles');
    const vehicleToSell = ownedVehicles.find(v => v.name === vehicleName);
    
    if (!vehicleToSell) return;
  
    const sellPrice = Math.round(vehicleToSell.purchasePrice * 0.8);
  
    await updateCredits(sellPrice);
   
    await deleteItem('ownedVehicles', vehicleName, 'vehicles');
  
    displayOwnedVehicles();
  }

async function updateCredits(amount = 0) {
    let currentCredits = parseInt(localStorage.getItem("credits")) || 0;
    
    currentCredits += amount;
    
    currentCredits = Math.max(currentCredits, 0);
    
    localStorage.setItem("credits", currentCredits);
    
    const creditDisplay = document.getElementById("creditDisplay");
    if (creditDisplay) creditDisplay.textContent = `Credits: ${currentCredits}`;
  }

function updateVehiclePagination() {
  const totalPages = Math.ceil(allVehicles.length / vehiclesPerPage);
  const pageInfo = document.getElementById('vehiclePageInfo');
  const prevBtn = document.getElementById('prevVehiclesBtn');
  const nextBtn = document.getElementById('nextVehiclesBtn');
  
  pageInfo.textContent = `Side ${currentVehiclePage} av ${totalPages}`;
  
  prevBtn.disabled = currentVehiclePage === 1;
  nextBtn.disabled = currentVehiclePage === totalPages;
}

document.getElementById('prevVehiclesBtn').addEventListener('click', () => {
  if (currentVehiclePage > 1) {
    currentVehiclePage--;
    displayVehicles();
  }
});

document.getElementById('nextVehiclesBtn').addEventListener('click', () => {
  const totalPages = Math.ceil(allVehicles.length / vehiclesPerPage);
  if (currentVehiclePage < totalPages) {
    currentVehiclePage++;
    displayVehicles();
  }
});

document.addEventListener('DOMContentLoaded', initVehicles);