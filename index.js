var searchText;
var emojiList;

function onLoad() {
  searchText = document.getElementsByClassName("text")[0];
  emojiList = document.getElementsByClassName("list")[0];

  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("click", onClick);
  drawList();
}

function asItem(key) {
  var value = emoji[key];
  var div = document.createElement("div");
  div.id = key;
  div.title = key;
  var emojiDiv = document.createElement("span");
  emojiDiv.innerText = value;
  div.appendChild(emojiDiv);
  var nameDiv = document.createElement("span");
  nameDiv.innerText = key;
  div.appendChild(nameDiv);
  return div;
}

function drawList() {
  var keywords = searchText.value
    .toLowerCase()
    .replace(/[,]/gi, " ")
    .replace(/[^a-z\d*# ]/gi, "")
    .split(" ");

  function hasKeyword(emojiKey) {
    for (var i = 0; i < keywords.length; i++) {
      if (emojiKey.toLowerCase().indexOf(keywords[i]) !== -1) return true;
    }
    return false;
  }

  var keys = Object.keys(emoji).filter(hasKeyword);
  emojiList.replaceChildren(...keys.map(asItem));
}

function onKeyUp(e) {
  drawList();
}

function onClick(e) {
  var id = e.target.id;
  if ((id || "") === "") id = e.target.parentElement.id;
  var value = emoji[id];
  if (value === undefined) return;
  var bits = [];
  var i;
  for (i = 0; i < value.length; i++) {
    const hex = value.codePointAt(i).toString(16);
    if (hex.length <= 4) {
      bits.push("\\u" + hex);
    } else {
      bits.push("\\u{" + hex + "}");
      i++; // skip next code as this one overlaps into it
    }
  }

  document.getElementsByClassName("emoji-key")[0].innerText = id;
  document.getElementsByClassName("emoji-value")[0].innerText = value;
  document.getElementsByClassName("emoji-encoded")[0].innerText = bits.join("");
  navigator.clipboard.writeText(id);
}
window.addEventListener("load", onLoad);
