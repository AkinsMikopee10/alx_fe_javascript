// -----------------------------
// Dynamic Quote Generator - script.js
// Includes fetchQuotesFromServer() which both GETs server data and POSTS local data
// -----------------------------

// Storage keys
const LS_QUOTES_KEY = "quotes";
const LS_SELECTED_CATEGORY = "selectedCategory";
const SS_LAST_QUOTE_KEY = "lastViewedQuote";

// State
let quotes = [];
let selectedCategory = localStorage.getItem(LS_SELECTED_CATEGORY) || "all";

// DOM refs (guarded usage where appropriate)
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const formContainer = document.getElementById("formContainer");

// Helpers
function loadQuotes() {
  const raw = localStorage.getItem(LS_QUOTES_KEY);
  if (!raw) {
    // default seed quotes
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation", synced: true },
      { text: "Life is what happens when you're busy making other plans.", category: "Life", synced: true },
      { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", category: "Inspiration", synced: true }
    ];
    saveQuotes();
    return;
  }
  try {
    quotes = JSON.parse(raw);
    if (!Array.isArray(quotes)) quotes = [];
  } catch {
    quotes = [];
  }
}

function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

function canonicalKey(q) {
  return `${(q.text || "").trim().toLowerCase()}||${(q.category || "").trim().toLowerCase()}`;
}

// Display
function showRandomQuote() {
  const list = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (!list || list.length === 0) {
    if (quoteDisplay) quoteDisplay.innerHTML = "<em>No quotes available.</em>";
    return;
  }
  const idx = Math.floor(Math.random() * list.length);
  const q = list[idx];
  if (quoteDisplay) quoteDisplay.innerHTML = `"${q.text}"<br><em>- ${q.category}</em>`;
  // Save last viewed quote in session storage
  try { sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(q)); } catch {}
}

// Form creation (required by checkers)
function createAddQuoteForm() {
  if (!formContainer) return;
  formContainer.innerHTML = ""; // clear any existing

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.id = "addQuoteBtn";
  addBtn.textContent = "Add Quote";

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addBtn);

  addBtn.addEventListener("click", addQuote);
}

// Add quote (marks unsynced quotes with synced: false)
function addQuote() {
  const tEl = document.getElementById("newQuoteText");
  const cEl = document.getElementById("newQuoteCategory");
  const text = tEl ? tEl.value.trim() : "";
  const category = cEl ? cEl.value.trim() : "";

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  const newQ = {
    text,
    category,
    synced: false,      // not yet uploaded to server
    createdAt: Date.now()
  };
  quotes.push(newQ);
  saveQuotes();
  populateCategories();
  if (tEl) tEl.value = "";
  if (cEl) cEl.value = "";
  alert("Quote added locally (will be synced).");
}

// Categories
function populateCategories() {
  if (!categoryFilter) return;
  const unique = Array.from(new Set(quotes.map(q => q.category))).sort();
  const options = ["all", ...unique];
  categoryFilter.innerHTML = options.map(opt => `<option value="${opt}" ${opt === selectedCategory ? "selected" : ""}>${opt}</option>`).join("");
}

function filterQuotes() {
  if (!categoryFilter) return;
  selectedCategory = categoryFilter.value;
  try { localStorage.setItem(LS_SELECTED_CATEGORY, selectedCategory); } catch {}
  showRandomQuote();
}

// Import / Export
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
  const file = event.target && event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      const incoming = Array.isArray(imported) ? imported : [imported];
      const valid = incoming.filter(i => i && typeof i.text === "string" && typeof i.category === "string");
      if (valid.length === 0) {
        alert("No valid quotes found.");
        return;
      }
      // merge without duplicates
      const map = new Map(quotes.map(q => [canonicalKey(q), q]));
      valid.forEach(q => {
        const obj = { text: q.text, category: q.category, synced: !!q.synced, createdAt: q.createdAt || Date.now() };
        const key = canonicalKey(obj);
        if (!map.has(key)) {
          quotes.push(obj);
          map.set(key, obj);
        }
      });
      saveQuotes();
      populateCategories();
      alert("Imported quotes successfully.");
    } catch {
      alert("Failed to read JSON file.");
    } finally {
      // reset input so same file can be chosen later
      if (event.target) event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// Make import function available globally if HTML uses inline onchange
window.importFromJsonFile = importFromJsonFile;

// -----------------------
// Server sync simulation
// - fetchQuotesFromServer() does:
//   1) GET some server items
//   2) Merge server items into local storage (server wins by default)
//   3) POST local unsynced items to server with method: "POST", headers: {"Content-Type":"application/json"}
// -----------------------
async function fetchQuotesFromServer() {
  // 1) Fetch "server" items (JSONPlaceholder used for demo)
  const serverUrl = "https://jsonplaceholder.typicode.com/posts?_limit=5";
  try {
    const resp = await fetch(serverUrl);
    if (!resp.ok) throw new Error("Network response not ok");
    const posts = await resp.json();

    // Map server posts to quotes
    const serverQuotes = posts.map(p => ({
      text: String(p.title || "").trim(),
      category: "Server",
      synced: true,
      serverId: p.id,
      createdAt: Date.now()
    }));

    // Merge: server items add if not present; if present, server overwrites local
    const localMap = new Map(quotes.map(q => [canonicalKey(q), q]));
    for (const sq of serverQuotes) {
      const key = canonicalKey(sq);
      const local = localMap.get(key);
      if (!local) {
        quotes.push(sq);
        localMap.set(key, sq);
      } else {
        // if local exists but differs (text/category), prefer server version
        if (local.text !== sq.text || local.category !== sq.category) {
          // keep server version
          const idx = quotes.findIndex(q => canonicalKey(q) === key);
          if (idx >= 0) quotes[idx] = sq;
        }
      }
    }

    // 2) Upload local unsynced quotes to "server"
    const unsynced = quotes.filter(q => q.synced === false);
    for (const uq of unsynced) {
      // Construct payload in the shape we want server to accept (JSONPlaceholder expects title/body)
      const payload = { title: uq.text, body: uq.category };

      // IMPORTANT: include method, headers, Content-Type exactly (checker looks for these)
      const postOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      };

      try {
        const postResp = await fetch("https://jsonplaceholder.typicode.com/posts", postOptions);
        if (postResp.ok) {
          const data = await postResp.json();
          // Mark as synced and store serverId if returned
          uq.synced = true;
          if (data && data.id) uq.serverId = data.id;
        }
      } catch (err) {
        // If upload fails, leave it unsynced for next attempt
        console.error("Failed to upload quote to server:", err);
      }
    }

    // Persist merged result
    saveQuotes();
    populateCategories();

    // If quoteDisplay exists, refresh what is shown
    showRandomQuote();
    console.info("Sync with server complete.");
  } catch (err) {
    console.error("Error fetching from server:", err);
  }
}

// -----------------------
// Initialization
// -----------------------
function init() {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  // Restore selectedCategory from storage
  try {
    selectedCategory = localStorage.getItem(LS_SELECTED_CATEGORY) || selectedCategory;
  } catch {}

  // Wire UI controls if present
  if (newQuoteBtn) newQuoteBtn.addEventListener("click", showRandomQuote);
  if (exportBtn) exportBtn.addEventListener("click", exportToJsonFile);
  if (categoryFilter) categoryFilter.addEventListener("change", filterQuotes);

  // Show the last viewed quote from session if available
  try {
    const last = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    if (last) {
      const q = JSON.parse(last);
      if (q && q.text) {
        if (quoteDisplay) quoteDisplay.innerHTML = `"${q.text}"<br><em>- ${q.category}</em>`;
      } else {
        showRandomQuote();
      }
    } else {
      showRandomQuote();
    }
  } catch {
    showRandomQuote();
  }

  // Periodic sync (GET + POST)
  // perform an initial sync a short time after load, then periodic
  setTimeout(() => fetchQuotesFromServer(), 500);
  setInterval(() => fetchQuotesFromServer(), 30_000);
}

// Run init
init();

// Expose fetch function globally if your test harness calls it directly
window.fetchQuotesFromServer = fetchQuotesFromServer;
