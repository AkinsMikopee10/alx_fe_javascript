let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Imagination is more important than knowledge.", category: "Inspiration" }
];

let currentCategory = null;

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryContainer = document.getElementById('categoryContainer');

// -----------------------------
// Show a random quote
// -----------------------------
function showRandomQuote() {
  let filteredQuotes = currentCategory 
    ? quotes.filter(q => q.category === currentCategory) 
    : quotes;

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `"${quote.text}" <br> <em>- ${quote.category}</em>`;
}

// -----------------------------
// Add a new quote
// -----------------------------
function addQuote() {
  const quoteInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    updateCategories();
    quoteInput.value = "";
    categoryInput.value = "";
    alert("Quote added successfully!");
  }
}

// -----------------------------
// Create the Add Quote form dynamically
// -----------------------------
function createAddQuoteForm() {
  const formContainer = document.getElementById('formContainer');

  // Create input for quote text
  const quoteInput = document.createElement('input');
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  // Create input for category
  const categoryInput = document.createElement('input');
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  // Create button
  const addButton = document.createElement('button');
  addButton.id = "addQuoteBtn";
  addButton.textContent = "Add Quote";

  // Append them to container
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  // Hook up event listener for adding quotes
  addButton.addEventListener('click', addQuote);
}

// -----------------------------
// Update category buttons dynamically
// -----------------------------
function updateCategories() {
  categoryContainer.innerHTML = "";

  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      currentCategory = cat;
      showRandomQuote();
    });
    categoryContainer.appendChild(btn);
  });

  // Add "All" button
  const allBtn = document.createElement('button');
  allBtn.textContent = "All";
  allBtn.addEventListener('click', () => {
    currentCategory = null;
    showRandomQuote();
  });
  categoryContainer.appendChild(allBtn);
}

// -----------------------------
// Init
// -----------------------------
newQuoteBtn.addEventListener('click', showRandomQuote);

createAddQuoteForm();   // dynamically build the form
updateCategories();
showRandomQuote();
