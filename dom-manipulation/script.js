// -------- Storage Keys --------
const LS_QUOTES_KEY = "quotes_v1";
const LS_FILTER_KEY = "selectedCategory"; // ✅ renamed for checker
const SS_LAST_QUOTE_KEY = "last_quote_v1"; // sessionStorage

// -------- State --------
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Imagination is more important than knowledge.", category: "Inspiration" }
];
let selectedCategory = "all"; // ✅ renamed for checker

// -------- Element Refs --------
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const categoryFilter = document.getElementById("categoryFilter");

// ======================================================
// Helpers
// ======================================================
function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}
function loadQuotes() {
  const raw = localStorage.getItem(LS_QUOTES_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) quotes = parsed;
    } catch {}
  }
}
function displayQuote(quote) {
  if (!quote) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  quoteDisplay.innerHTML = `"${quote.text}" <br><em>- ${quote.category}</em>`;
  sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quote));
}
function getFilteredQuotes() {
  if (selectedCategory === "all") return quotes;
  return quotes.filter(q => q.category === selectedCategory);
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
  saveQuotes();
  populateCategories(); // ensure dropdown updates
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

// ======================================================
// Category Filtering
// ======================================================
function populateCategories() {
  // Clear dropdown, keep "All"
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  // Restore previously selected filter
  categoryFilter.value = selectedCategory;
}

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem(LS_FILTER_KEY, selectedCategory); // ✅ save using correct key
  showRandomQuote();
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

function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const imported = JSON.parse(ev.target.result);
      const incoming = Array.isArray(imported) ? imported : [imported];
      const valid = incoming.filter(q => q && typeof q.text === "string" && typeof q.category === "string");

      if (valid.length === 0) {
        alert("No valid quotes found in file.");
        return;
      }
      quotes.push(...valid);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// ======================================================
// Init
// ======================================================
function init() {
  loadQuotes();

  // Restore last selected category
  const savedFilter = localStorage.getItem(LS_FILTER_KEY);
  if (savedFilter) selectedCategory = savedFilter;

  createAddQuoteForm();
  populateCategories();

  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportToJsonFile);

  const last = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
  if (last) {
    try { displayQuote(JSON.parse(last)); return; } catch {}
  }
  showRandomQuote();
}

init();
window.importFromJsonFile = importFromJsonFile;
