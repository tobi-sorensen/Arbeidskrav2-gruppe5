// Felles API, LocalStorage, CRUD

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