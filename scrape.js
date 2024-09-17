// Script to parse data from
// https://unicode.org/emoji/charts/full-emoji-list.html
// and past results into ./emoji.js

var tr = Array.prototype.slice.call(document.getElementsByTagName("tr"));
var trText = tr.map(tr => tr.innerText);
var trNumberedText = trText.filter(text => /^\d+/.test(text));
var trCellText = trNumberedText.map(text => text.split('\t'));
var parseUnicodeEscape = text => text
  .replace(/U\+/g, '\\u{')
  .replace(/\s+|$/g, '}')
  .toLowerCase();
var parseWordsAndSpaces = text => {
  return text.normalize("NFD") // decompose into characters + combining marks
    .replace(/[\u0300-\u036f]/g, '') // remove combining marks
    // Spell it out
    .replace(/[&]/g, "And")
    // remove apostrophes
    .replace(/['\u2019\x60]/g, "")
    .replace(/: #/g, " hash")
    .replace(/: \*/g, " asterisk")
    .replace(/1st/g, " first")
    .replace(/2nd/g, " second")
    .replace(/3rd/g, " third")
    // we only want letters and numbers for key names.
    // change reset to underscore
    .replace(/[^a-z\d]/gi, "_")
}

var noBigHumps = text => {
  // Fix all-caps: ZZZ
  if (/^[A-Z]+$/.test(text)) return text.toLowerCase();
  // Fix initial caps: OKButton, BACKArrow
  text = text.replace(/^([A-Z]+)[A-Z][a-z]/, (search, replace) => {
    return replace.toLowerCase() + search.slice(-2)
  });

  // Fix endings: personGesturingOK womanGesturingNO
  text = text.replace(/[a-z][A-Z]([A-Z]+)$/, (search, replace) => {
    return search.slice(0, 2) + replace.toLowerCase()
  });

  text = text.charAt(0).toLowerCase() + text.slice(1);

  return text;
}
var camelCase = text =>
  noBigHumps(text.split("_")
    .reduce(
      (camel, hump) =>
        hump.length === 0
          ? camel
          : camel + hump.charAt(0).toUpperCase() + hump.slice(1),
      ""
    ));

var parseKey = text => camelCase(parseWordsAndSpaces(text));

var entries = trCellText.map(cells => {
  const last = cells.pop();
  return [
    parseKey(last),
    parseUnicodeEscape(cells[1]),
    last
  ]
});
emojiJs = entries
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value, name]) => `/** ${name} ${value} */\r\n  ${key}: "${value}"`)
  .join(",\r\n  ");

// setup rest of code template
emojiJs =
  "export default {\r\n  " +
  emojiJs +
  "\r\n};\r\n";

console.log("click the page somewhere..."); // otherwise dom is not active

// Wait a moment for that click...
var timeoutId = setTimeout(() => {
  // copy code to clipboard
  navigator.clipboard.writeText(emojiJs).then(
    () => console.log("copied"),
    e => {
      console.error("error. Maybe you were not quick enough? Here... try this");
      console.log(emojiJs);
    }
  );
}, 1000); // one second later...
