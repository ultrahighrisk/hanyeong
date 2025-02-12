const jsonUrl = chrome.runtime.getURL("data/dict_most_frequent.json");
let db;

fetch(jsonUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log("Loaded JSON:", data[0]);
    db = data;
  })
  .catch((error) => {
    console.error("Error loading JSON:", error);
  });

document.addEventListener("mousemove", function (e) {
  let hoveredWord = getWordAtPoint(e.target, e.clientX, e.clientY);
  if (hoveredWord) {
    if (isKorean(hoveredWord)) {
      // console.log("Word: " + hoveredWord);
      if (db !== null) {
        let isMatch = false;
        for (let i in db) {
          if (hoveredWord == db[i].Hangul || hoveredWord == db[i].TypeKr) {
            console.log("Matched entry for: " + hoveredWord, db[i]);
            isMatch = true;
          }
        }

        if (!isMatch) {
          console.log("Match not found!");
        }
      }
    }
  }

  let hoveredCharacter = getCharacterAtPoint(e.target, e.clientX, e.clientY);
  if (hoveredCharacter) {
    if (isKorean(hoveredCharacter)) {
      // console.log("Character: " + hoveredCharacter);
    }
  }
});

const isKorean = (input) => {
  const match = input.match(/[\u3130-\u318F\uAC00-\uD7AF]/g);
  return match ? match.length === input.length : false;
};

function getCharacterAtPoint(elem, x, y) {
  if (elem.nodeType === Node.TEXT_NODE) {
    var range = document.createRange();
    range.selectNodeContents(elem);

    var currentPos = 0;
    var endPos = range.endOffset;

    while (currentPos < endPos) {
      range.setStart(elem, currentPos);
      range.setEnd(elem, currentPos + 1);

      var rect = range.getBoundingClientRect();

      if (
        rect.left <= x &&
        rect.right >= x &&
        rect.top <= y &&
        rect.bottom >= y
      ) {
        var charUnderCursor = range.toString();
        range.detach();
        return charUnderCursor;
      }

      currentPos += 1;
    }
  } else {
    for (var i = 0; i < elem.childNodes.length; i++) {
      var result = getCharacterAtPoint(elem.childNodes[i], x, y);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

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
