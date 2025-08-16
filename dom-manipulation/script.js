let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Imagination is more important than knowledge.", category: "Inspiration" }
];

let currentCategory = null;

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const categoryContainer = document.getElementById('categoryContainer');

const quoteInput = document.getElementById('newQuoteText');
const categoryInput = document.getElementById('newQuoteCategory');

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

function addQuote() {
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

  const allBtn = document.createElement('button');
  allBtn.textContent = "All";
  allBtn.addEventListener('click', () => {
    currentCategory = null;
    showRandomQuote();
  });
  categoryContainer.appendChild(allBtn);
}

newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);

updateCategories();
showRandomQuote();
