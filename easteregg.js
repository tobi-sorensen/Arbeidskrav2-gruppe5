// *Extra*  Easter Egg: Konami kode gir deg credits
const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
// Holder øye med hvor langt bruker har kommet i kode tastingen
let konamiIndex = 0;

// Hver gang man trykker følges det for å se om det er korrekt
document.addEventListener("keydown", (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      console.log("Easter Egg aktivert – +100000 credits!");

      // Henter creditbeholdning og legger til easter egg bonus
      let currentCredits = parseInt(localStorage.getItem("credits")) || 0;
      currentCredits += 100000;
      localStorage.setItem("credits", currentCredits);

      // Oppdaterer credits så det samhandler med alerten
      updateCredits();

      alert("Gratulerer du har funnet en hemmelig bonus! +70.000 credits");

      // Reset
      konamiIndex = 0;
    }
    // Hvis det tastes feil må man starte kode inntasting på nytt
  } else {
    konamiIndex = 0;
  }
});
