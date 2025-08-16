// -------- Storage Keys --------
const LS_QUOTES_KEY = "quotes_v1";
const SS_LAST_QUOTE_KEY = "last_quote_v1"; // sessionStorage (optional req)

// -------- State --------
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Imagination is more important than knowledge.", category: "Inspiration" }
];
let currentCategory = null;

// -------- Element Refs (static) --------
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryContainer = document.getElementById("categoryContainer");
const exportBtn = document.getElementById("exportBtn");

// ======================================================
// Helpers
// ======================================================
function saveQuotes() {
  // Persist to localStorage on every change
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const raw = localStorage.getItem(LS_QUOTES_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // keep only valid objects
      quotes = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
    }
  } catch {
    // ignore malformed data
  }
}

function displayQuote(quote) {
  if (!quote) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  quoteDisplay.innerHTML = `"${quote.text}" <br><em>- ${quote.category}</em>`;
  // Save last viewed quote for this session (optional requirement)
  sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quote));
}

function getFilteredQuotes() {
  return currentCategory ? quotes.filter(q => q.category === currentCategory) : quotes;
}

// ======================================================
// Core Features
// ======================================================
function showRandomQuote() {
  const list = getFilteredQuotes();
  if (list.length === 0) {
    displayQuote(null);
    return;
  }
  const idx = Math.floor(Math.random() * list.length);
  displayQuote(list[idx]);
}

function addQuote() {
  const quoteInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please fill in both the quote and its category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();           // <-- persist to localStorage
  updateCategories();     // reflect any new category immediately
  quoteInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.id = "addQuoteBtn";
  addButton.textContent = "Add Quote";

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  addButton.addEventListener("click", addQuote);
}

function updateCategories() {
  categoryContainer.innerHTML = "";
  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      currentCategory = cat;
      showRandomQuote();
    });
    categoryContainer.appendChild(btn);
  });

  const allBtn = document.createElement("button");
  allBtn.textContent = "All";
  allBtn.addEventListener("click", () => {
    currentCategory = null;
    showRandomQuote();
  });
  categoryContainer.appendChild(allBtn);
}

// ======================================================
// Import / Export (JSON)
// ======================================================
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// EXACT name + pattern per your instructions
function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function (ev) {
    try {
      const imported = JSON.parse(ev.target.result);

      // Accept either an array of quotes or a single quote object
      const incoming = Array.isArray(imported) ? imported : [imported];

      // Validate and normalize
      const valid = incoming.filter(
        q => q && typeof q.text === "string" && typeof q.category === "string"
      );

      if (valid.length === 0) {
        alert("No valid quotes found in the file.");
        return;
      }

      quotes.push(...valid);
      saveQuotes();
      updateCategories();
      showRandomQuote();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    } finally {
      // reset input so the same file can be chosen again if needed
      event.target.value = "";
    }
  };
  fileReader.readAsText(file);
}

// ======================================================
// Init
// ======================================================
function init() {
  // Load persisted quotes (localStorage)
  loadQuotes();

  // Build UI pieces
  createAddQuoteForm();
  updateCategories();

  // Wire buttons
  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportToJsonFile);

  // If session has a last quote, show it; otherwise show random
  const last = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
  if (last) {
    try {
      displayQuote(JSON.parse(last));
      return;
    } catch {
      // fall through to random
    }
  }
  showRandomQuote();
}

init();

// Expose import handler to global for the inline onchange in HTML
window.importFromJsonFile = importFromJsonFile;
