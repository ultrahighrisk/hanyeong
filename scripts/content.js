const jsonUrl = chrome.runtime.getURL("data/dict_most_frequent.json");
let db = null;

fetch(jsonUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log("Loaded JSON:", data[0]);
    db = new Map();
    data.forEach(entry => {
      if (entry.Hangul) {
        if (!db.has(entry.Hangul)) {
          db.set(entry.Hangul, []);
        }
        db.get(entry.Hangul).push(entry);
      }
      if (entry.TypeKr && entry.TypeKr !== entry.Hangul) {
        if (!db.has(entry.TypeKr)) {
          db.set(entry.TypeKr, []);
        }
        db.get(entry.TypeKr).push(entry);
      }
    });
    console.log("Dictionary loaded into Map with", db.size, "unique words");
  })
  .catch((error) => {
    console.error("Error loading JSON:", error);
  });

document.addEventListener("mousemove", function (e) {
  let hoveredWord = getWordAtPoint(e.target, e.clientX, e.clientY);
  if (hoveredWord && isKorean(hoveredWord) && db) {
    if (db.has(hoveredWord)) {
      const entries = db.get(hoveredWord);
      console.log("Matched entries for: " + hoveredWord, entries);
    } else {
      console.log("Match not found for: " + hoveredWord);
    }
  }
});

const isKorean = (input) => {
  const match = input.match(/[\u3130-\u318F\uAC00-\uD7AF]/g);
  return match ? match.length === input.length : false;
};

function getWordAtPoint(elem, x, y) {
  if (elem.nodeType == elem.TEXT_NODE) {
    var range = elem.ownerDocument.createRange();
    range.selectNodeContents(elem);

    var currentPos = 0;
    var endPos = range.endOffset;

    while (currentPos + 1 < endPos) {
      range.setStart(elem, currentPos);
      range.setEnd(elem, currentPos + 1);

      if (
        range.getBoundingClientRect().left <= x &&
        range.getBoundingClientRect().right >= x &&
        range.getBoundingClientRect().top <= y &&
        range.getBoundingClientRect().bottom >= y
      ) {
        range.expand("word");
        var ret = range.toString();
        range.detach();
        return ret;
      }

      currentPos += 1;
    }
  } else {
    for (var i = 0; i < elem.childNodes.length; i++) {
      var range = elem.childNodes[i].ownerDocument.createRange();
      range.selectNodeContents(elem.childNodes[i]);

      if (
        range.getBoundingClientRect().left <= x &&
        range.getBoundingClientRect().right >= x &&
        range.getBoundingClientRect().top <= y &&
        range.getBoundingClientRect().bottom >= y
      ) {
        range.detach();
        return getWordAtPoint(elem.childNodes[i], x, y);
      } else {
        range.detach();
      }
    }
  }
  return null;
}
