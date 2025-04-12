// Fetch the JSON dictionary from the extension's data folder
const jsonUrl = chrome.runtime.getURL("data/dict_most_frequent.json");
let db;

// Load the dictionary and store it in a Map for fast lookups
fetch(jsonUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log("Loaded JSON sample:", data[0]);
    db = new Map();
    count = 0
    data.forEach(entry => {
      count += 1;
      const hangul = entry.Hangul;
      if (hangul) {
        if (!db.has(hangul)) {
          db.set(hangul, []);
        }
        db.get(hangul).push(entry);
      }
    });
    console.log("Entry count: ", count);
    console.log("Dictionary loaded with", db.size, "unique words");
  })
  .catch((error) => {
    console.error("Error loading JSON:", error);
  });

// Function to check if a string contains Korean characters
function isKorean(text) {
  return /[\uAC00-\uD7AF]/.test(text); // Matches basic Hangul range
}

// Function to get the word at the cursor position
function getWordAtPoint(element, x, y) {
  const range = document.caretRangeFromPoint(x, y);
  if (!range) return null;
  range.expand('word');
  return range.toString().trim();
}

// List of common Korean particles to strip from nouns
const particles = [
  '을', '를', '이', '가', '은', '는', '에', '에서', '으로', '와',
  '과', '도', '만', '조차', '마저', '까지', '부터', '에게', '한테',
  '께', '보다', '처럼', '같이', '보다도', '따라', '대로'
];

// Function to get the base word by stripping particles
function getBaseWord(word) {
  for (const particle of particles) {
    if (word.endsWith(particle)) {
      return word.slice(0, -particle.length);
    }
  }
  return word;
}

// Event listener for mouse movement to detect hovered words
document.addEventListener("mousemove", function (e) {
  let hoveredWord = getWordAtPoint(e.target, e.clientX, e.clientY);
  if (hoveredWord && isKorean(hoveredWord) && db) {
    const baseWord = getBaseWord(hoveredWord);
    let entries;
    if (db.has(baseWord)) {
      entries = db.get(baseWord);
      console.log("Matched entries for: " + baseWord, entries);
    } else if (db.has(hoveredWord)) {
      entries = db.get(hoveredWord);
      console.log("Matched entries for: " + hoveredWord, entries);
    } else {
      console.log("Match not found for: " + hoveredWord);
    }
    // Future enhancement: Replace console.log with a tooltip to display entries
  }
});
