// Simulerer local storage for Node
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

// Importerer funksjoner fra export versjon av apilocalcrud
import {
  saveToLocalStorage,
  getFromLocalStorage,
  createItem,
  deleteItem,
  editItem,
} from "../apilocalcrud.export.js";

// Reset
beforeEach(() => {
  localStorage.clear();
});

// Testene
test("1. Lagrer og henter data korrekt", () => {
  const data = [{ name: "Test Person", species: "Human" }];
  saveToLocalStorage("characters", data);
  const result = getFromLocalStorage("characters");
  expect(result).toEqual(data);
});

test("2. Oppretter ny karakter i localStorage", () => {
  const char = { name: "Lars", birthYear: "2001", species: "Human", films: [] };
  createItem("characters", char);
  const result = getFromLocalStorage("characters");
  expect(result).toContainEqual(char);
});

test("3. Sletter karakter fra localStorage", () => {
  const char = {
    name: "SlettMeg",
    birthYear: "1999",
    species: "Droid",
    films: [],
  };
  saveToLocalStorage("characters", [char]);
  deleteItem("characters", "SlettMeg");
  const result = getFromLocalStorage("characters");
  expect(result).not.toContainEqual(char);
});

test("4. Redigerer en karakter", () => {
  const char = {
    name: "RedigerMeg",
    birthYear: "1990",
    species: "Human",
    films: [],
  };
  saveToLocalStorage("characters", [char]);
  editItem("characters", "RedigerMeg", { species: "Wookie" });
  const result = getFromLocalStorage("characters");
  expect(result[0].species).toBe("Wookie");
});

test("5. Legger til flere karakterer og sjekker antall", () => {
  const a = { name: "Luke", birthYear: "19BBY", species: "Human", films: [] };
  const b = { name: "Leia", birthYear: "19BBY", species: "Human", films: [] };
  createItem("characters", a);
  createItem("characters", b);
  const result = getFromLocalStorage("characters");
  expect(result.length).toBe(2);
});
