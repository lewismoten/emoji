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
  window.foo = e;
  var id = e.target.id;
  if ((id || "") === "") id = e.target.parentElement.id;
  document.getElementsByClassName("emoji-key")[0].innerText = id;
  document.getElementsByClassName("emoji-value")[0].innerText = emoji[id];
  navigator.clipboard.writeText(id);
}
window.addEventListener("load", onLoad);
