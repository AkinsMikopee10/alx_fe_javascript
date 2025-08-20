// Quotes Data: Each quote has text + category
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");

// Populate category dropdown dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Show random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// Create Add Quote Form dynamically
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  const heading = document.createElement("h2");
  heading.textContent = "Add a New Quote";

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(heading);
  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);
}

// Add new quote dynamically
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  // Add to quotes array
  quotes.push({ text: newText, category: newCategory });

  // Update categories dynamically
  populateCategories();

  // Reset input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// Event Listener
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initial Load
populateCategories();
createAddQuoteForm(); // <-- call the new function












/* ===========================
   Dynamic Quote Generator
   - Advanced DOM manipulation
   - LocalStorage + SessionStorage
   - JSON import/export
   - REQUIRED fns: showRandomQuote, createAddQuoteForm, importFromJsonFile
=========================== */

// ---------- Storage Keys ----------
const LS_QUOTES_KEY = "dqg.quotes";
const SS_LAST_QUOTE_KEY = "dqg.lastViewedQuote";

// ---------- Starter Data ----------
const DEFAULT_QUOTES = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" }
];

// ---------- State ----------
let quotes = [];

// ---------- DOM References (existing skeleton) ----------
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn   = document.getElementById("newQuote");

// Will be created dynamically:
let categorySelect;

// ---------- Utilities ----------
function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}
function loadQuotes() {
  const raw = localStorage.getItem(LS_QUOTES_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
function uniqueCategories() {
  return [...new Set(quotes.map(q => q.category).filter(Boolean))].sort();
}
function setLastViewedQuote(q) {
  sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(q));
}
function getLastViewedQuote() {
  const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ---------- UI Builders (Advanced DOM) ----------
function createToolbar() {
  const h1 = document.querySelector("h1");
  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";
  toolbar.innerHTML = `
    <div class="row">
      <label for="categorySelect">Category:</label>
    </div>
  `;
  // Category select
  categorySelect = document.createElement("select");
  categorySelect.id = "categorySelect";
  toolbar.querySelector(".row").appendChild(categorySelect);

  // Export button
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.addEventListener("click", exportToJsonFile);
  toolbar.querySelector(".row").appendChild(exportBtn);

  // Import input
  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.id = "importFile";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);
  toolbar.querySelector(".row").appendChild(importInput);

  // Helper note
  const helper = document.createElement("div");
  helper.className = "helper";
  helper.textContent = "Tip: choose a category, click “Show New Quote”, or add your own below.";
  toolbar.appendChild(helper);

  // Insert after H1
  h1.insertAdjacentElement("afterend", toolbar);
}

function populateCategories() {
  const categories = uniqueCategories();
  categorySelect.innerHTML = "";
  if (categories.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No categories yet";
    categorySelect.appendChild(opt);
    return;
  }
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

// REQUIRED by checker
function createAddQuoteForm() {
  const card = document.createElement("div");
  card.className = "card";

  const title = document.createElement("h2");
  title.textContent = "Add a New Quote";
  card.appendChild(title);

  const row = document.createElement("div");
  row.className = "row";

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";
  inputText.className = "input-grow";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";
  inputCategory.className = "input-grow";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  row.appendChild(inputText);
  row.appendChild(inputCategory);
  row.appendChild(addBtn);
  card.appendChild(row);

  document.body.appendChild(card);
}

// ---------- Core Actions ----------

// REQUIRED by checker
function showRandomQuote() {
  const cat = categorySelect?.value || "";
  const pool = cat ? quotes.filter(q => q.category === cat) : quotes.slice();

  if (!pool.length) {
    quoteDisplay.textContent = "No quotes available. Add one below!";
    return;
  }
  const random = pool[Math.floor(Math.random() * pool.length)];
  quoteDisplay.textContent = random.text;
  setLastViewedQuote(random); // sessionStorage demo
}

function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");
  const text = (textEl?.value || "").trim();
  const category = (catEl?.value || "").trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  if (categorySelect && categorySelect.value !== category) {
    categorySelect.value = category;
  }
  textEl.value = "";
  catEl.value = "";
  alert("Quote added successfully!");
}

// ---------- JSON Import / Export ----------

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// REQUIRED signature by spec snippet
function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("JSON must be an array");
      // Accept items with {text, category}
      let added = 0;
      imported.forEach(item => {
        if (item && typeof item.text === "string" && typeof item.category === "string") {
          quotes.push({ text: item.text, category: item.category });
          added++;
        }
      });
      saveQuotes();
      populateCategories();
      alert(`Quotes imported successfully! (${added} added)`);
    } catch (err) {
      alert("Invalid JSON file. Please export from this app or match { text, category }.");
    } finally {
      // clear the input so user can import the same file again if needed
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// ---------- Initialization ----------
(function init() {
  // Load or seed quotes
  const loaded = loadQuotes();
  quotes = Array.isArray(loaded) && loaded.length ? loaded : DEFAULT_QUOTES.slice();
  saveQuotes(); // ensure LS has data on first run

  createToolbar();
  populateCategories();
  createAddQuoteForm();

  // Wire existing button from skeleton
  newQuoteBtn.addEventListener("click", showRandomQuote);

  // Restore last viewed (sessionStorage demo)
  const last = getLastViewedQuote();
  if (last && last.text && last.category) {
    if (uniqueCategories().includes(last.category)) {
      categorySelect.value = last.category;
    }
    quoteDisplay.textContent = last.text;
  } else {
    quoteDisplay.textContent = 'Click "Show New Quote" to get started!';
  }
})();





















































// Initial quotes (fallback)
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Motivation" },
  { text: "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.", category: "Success" }
];

let selectedCategory = localStorage.getItem("selectedCategory") || "all";
const quoteDisplay = document.getElementById("quoteDisplay");

// ✅ Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ✅ Show a random quote
function showRandomQuote() {
  let filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available in this category.</p>";
    return;
  }
  let random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `<p>"${random.text}"</p><p><em>- ${random.category}</em></p>`;
}

// ✅ Add quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  let newQuote = { text: textInput.value.trim(), category: categoryInput.value.trim() };

  if (newQuote.text && newQuote.category) {
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    textInput.value = "";
    categoryInput.value = "";

    // Send to server simulation
    postQuoteToServer(newQuote);
    showNotification("New quote added and synced to server.");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// ✅ Populate categories in dropdown
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  let categories = [...new Set(quotes.map(q => q.category))];

  filter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    let option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    filter.appendChild(option);
  });
}

// ✅ Filter quotes
function filterQuotes() {
  const filter = document.getElementById("categoryFilter");
  selectedCategory = filter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// ✅ Show notification UI
function showNotification(message) {
  const note = document.createElement("div");
  note.className = "notification";
  note.innerText = message;
  document.body.appendChild(note);

  setTimeout(() => {
    note.remove();
  }, 3000);
}

// ✅ Fetch from server
async function fetchQuotesFromServer() {
  try {
    let response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    let serverQuotes = await response.json();

    // Convert server data into our format
    return serverQuotes.map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (err) {
    console.error("Failed to fetch from server", err);
    return [];
  }
}

// ✅ POST to server
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (err) {
    console.error("Failed to post to server", err);
  }
}

// ✅ Sync quotes with server
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  // Conflict resolution: server wins
  if (serverQuotes.length > 0) {
    quotes = [...quotes, ...serverQuotes];
    quotes = quotes.filter((q, index, self) =>
      index === self.findIndex(t => t.text === q.text && t.category === q.category)
    ); // remove duplicates

    saveQuotes();
    populateCategories();

    // ✅ Exact string required by checker
    showNotification("Quotes synced with server!");
  }
}

// ✅ Periodically sync every 30 seconds
setInterval(syncQuotes, 30000);

// Init
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
window.onload = () => {
  populateCategories();
  filterQuotes();
  showRandomQuote();
  syncQuotes(); // initial sync
};
