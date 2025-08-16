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
    showNotification("Quotes synced with server.");
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
