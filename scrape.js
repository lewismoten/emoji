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

var camelHead = text => {
  if (/^[A-Z]+$/.test(text)) return text.toLowerCase();
  // Some names have capitalized words (OKButton, BACKArrow, ZZZ).
  // Let's fix the camels head be "okButton" or "zzz"
  text = text.replace(/^([A-Z]+)[A-Z][a-z]/, (search, replace) => {
    return replace.toLowerCase() + search.slice(-2)
  });
  return text.charAt(0).toLowerCase() + text.slice(1);
}
var camelCase = text =>
  camelHead(text.split("_")
    .reduce(
      (camel, hump) =>
        hump.length === 0
          ? camel
          : camel + hump.charAt(0).toUpperCase() + hump.slice(1),
      ""
    ));

var parseKey = text => camelCase(parseWordsAndSpaces(text));

var entries = trCellText.map(cells => [
  parseKey(cells[cells.length - 1]),
  parseUnicodeEscape(cells[1])
]);
//entries.sort((a, b) => a[0].localeCompare(b[0]));
emojiJs = entries
  .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
  .map(([key, value]) => `${key}: "${value}"`)
  .join(",\r\n  ");

// setup rest of code template
emojiJs =
  "var emoji = {\r\n  " +
  emojiJs +
  "\r\n};\r\ntry {\r\n  if (module) module.exports = emoji;\r\n} catch (e) {\r\n  // not loaded as a module\r\n}\r\n";

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
