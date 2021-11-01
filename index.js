function onLoad() {
  var keys = Object.keys(emoji);
  var div = document.getElementsByClassName("list")[0];
  div.replaceChildren(...keys.map(asItem));
}

function asItem(key) {
  var value = emoji[key];
  var div = document.createElement("div", { title: key });
  var emojiDiv = document.createElement("span");
  emojiDiv.innerText = value;
  div.appendChild(emojiDiv);
  var nameDiv = document.createElement("span");
  nameDiv.innerText = key;
  div.appendChild(nameDiv);
  return div;
}

window.addEventListener("load", onLoad);
