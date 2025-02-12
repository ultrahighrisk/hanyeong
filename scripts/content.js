document.addEventListener("mousemove", function (e) {
  let hoveredWord = getWordAtPoint(e.target, e.clientX, e.clientY);
  if (hoveredWord) {
    if (isKorean(hoveredWord)) {
      console.log("Word: " + hoveredWord);
    }
  }

  let hoveredCharacter = getCharacterAtPoint(e.target, e.clientX, e.clientY);
  if (hoveredCharacter) {
    if (isKorean(hoveredCharacter)) {
      console.log("Character: " + hoveredCharacter);
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
