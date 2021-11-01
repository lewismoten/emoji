// Script to parse data from
// https://unicode.org/emoji/charts/full-emoji-list.html
// and past results into ./emoji.js

var emojiJs = Array.prototype.slice // convert collection to an array
  .call(document.getElementsByTagName("tr"))
  .map(t => t.innerText) // forget the DOM, lets get messy and grab the text
  .filter(t => /^\d+/.test(t)) // looking for numbered rows
  .map(
    (t, i) =>
      // let's parse out a quick and dirty `key: 'code',`
      (t.split("\t")[t.split("\t").length - 1] || "")
        // we only want letters for key names. change reset to underscore
        .replace(/[^a-z]/gi, "_") +
      ': "' +
      t
        .split("\t")[1] // second cell
        .replace(/U\+/g, "\\u{") // open unicode
        .replace(/ /g, "}") + // close multiple codes
      '}"' // close final code, add comma for next key in object
  )
  .map(t =>
    t
      .split("_") // keys are similar to snake_case. Let's change to camelCase
      .reduce(
        (camel, hump) =>
          hump.length === 0
            ? camel
            : camel + hump[0].toUpperCase() + hump.slice(1),
        ""
      )
  )
  .map(t => {
    // Some names have capitalized words (OKButton, BACKArrow).
    // Let's fix the camels head be "okButton"
    let m = t.match(/^([A-Z]+)[A-Z][a-z]/);
    return m === null ? t : t.replace(m[1], m[1].toLowerCase());
  })
  .map(t => {
    // for unicode JavaScript, the hex should be lower-case.
    let m = t.match(/\{([^}]+)\}/g);
    return m === null
      ? t
      : m.reduce((tt, mm) => tt.replace(mm, mm.toLowerCase()), t);
  })
  .map(t => t[0].toLowerCase() + t.slice(1)) // Everyone starts out lowercase
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
