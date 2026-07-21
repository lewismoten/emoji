import emoji from './dist/esm/index.js';

var items = [];
var groups = [];
var subGroups = {};
const NO_FILTER = 'Not applied';
var allIds = Object.keys(emoji);
var groupedKeys = {};
var byId = {};

var searchText;
var emojiList;
var matchCount;
var groupSelector;
var subGroupSelector;
var versionModeSelector;
var versionSelector;
var advancedFilters;
var example;
var skinToneCheckboxes;
var hairCheckboxes;
var versionManifests = [];
var versionKeys = new Map();

function onLoad() {
  searchText = document.getElementsByClassName("text")[0];
  emojiList = document.getElementsByClassName("list")[0];
  matchCount = document.getElementsByClassName('match-count')[0];
  groupSelector = document.getElementsByClassName('select-group')[0];
  subGroupSelector = document.getElementsByClassName('select-subgroup')[0];
  versionModeSelector = document.getElementsByClassName('select-version-mode')[0];
  versionSelector = document.getElementsByClassName('select-version')[0];
  advancedFilters = document.getElementsByClassName('advanced-filters')[0];
  example = document.getElementsByClassName('example')[0];
  skinToneCheckboxes = Array.from(document.getElementsByClassName('skin-tone'));
  hairCheckboxes = Array.from(document.getElementsByClassName('hair'));

  skinToneCheckboxes.forEach(checkbox => checkbox.addEventListener('change', drawList));
  hairCheckboxes.forEach(checkbox => checkbox.addEventListener('change', drawList));

  searchText.addEventListener("keyup", onKeyUp);
  emojiList.addEventListener("click", onClick);
  versionModeSelector.addEventListener('change', onVersionFilterChange);
  versionSelector.addEventListener('change', drawList);

  if (window.matchMedia('(max-width: 560px)').matches) {
    advancedFilters.open = false;
    example.open = false;
  }

  loadData();

  drawList();
}

async function loadData() {
  const data = await fetch('emoji.json').then(response => response.json());

  items = data;
      byId = items.reduce((byId, item) => ({ ...byId, [item.key]: item }), {});

      groups = items
        .reduce((all, item) => all.includes(item.group) ? all : [...all, item.group], [])
        .sort();

      subGroups = items.reduce((all, { group, subGroup }) => {
        if (!all[group]) all[group] = [];
        if (!all[group].includes(subGroup)) {
          all[group].push(subGroup);
          all[group].sort();
        }
        return all;
      }, {});
      groups.forEach(group => {
        subGroups[group].sort();
        subGroups[group].unshift(NO_FILTER);
      });

      while (groupSelector.firstChild)
        groupSelector.removeChild(groupSelector.firstChild);

      groups.unshift(NO_FILTER);
      groups.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.text = name;
        groupSelector.appendChild(option);
      });
      // Replacing the placeholder options can leave a browser holding on to its
      // old value ("Not loaded"). Reset to an unfiltered state before drawing.
      groupSelector.value = NO_FILTER;
      versionModeSelector.value = 'all';
      groupSelector.addEventListener('change', onChangeGroup);
      subGroupSelector.addEventListener('change', drawList)

      allIds = [];
      // sort keys by group, sub group, then key name
      groups.forEach(group => {
        if (group === NO_FILTER) return;
        groupedKeys[group] = {};
        subGroups[group].forEach(subGroup => {
          if (subGroup === NO_FILTER) return;
          groupedKeys[group][subGroup] = [];
          items.forEach(item => {
            if (item.group === group && item.subGroup === subGroup) {
              allIds.push(item.key);
              groupedKeys[group][subGroup].push(item.key);
            }
          })
        })
      })




      onChangeGroup();
      onClick({ target: { id: 'clinkingBeerMugs' } }, false)
      loadVersionData();
}

async function loadVersionData() {
  try {
    const manifest = await fetch('versions/manifest.json').then(response => response.json());
    const manifests = manifest.versions
      .filter(version => version.released)
      .sort((a, b) => a.released.localeCompare(b.released));
    const keys = await Promise.all(manifests.map(async version => [
      version.version,
      new Set(await fetch(`versions/${version.file}`).then(response => response.json()))
    ]));

    versionManifests = manifests;
    versionKeys = new Map(keys);
    populateVersionSelector();
    drawList();
  } catch (error) {
    console.warn('Version filters unavailable', error);
    versionModeSelector.disabled = true;
    versionSelector.disabled = true;
  }
}

function populateVersionSelector() {
  versionSelector.replaceChildren();
  versionManifests.forEach(version => {
    const option = document.createElement('option');
    option.value = version.version;
    option.text = `Emoji ${version.version} (${version.released})`;
    versionSelector.appendChild(option);
  });
  versionSelector.value = versionManifests.at(-1)?.version ?? '';
  versionSelector.disabled = true;
}

function onVersionFilterChange() {
  versionSelector.disabled = versionModeSelector.value === 'all';
  drawList();
}

function getVersionKeys() {
  if (versionModeSelector.value === 'all') return null;
  if (versionModeSelector.value === 'selected') {
    return versionKeys.get(versionSelector.value) ?? new Set();
  }

  const selectedIndex = versionManifests.findIndex(version => version.version === versionSelector.value);
  return new Set(versionManifests
    .slice(0, selectedIndex + 1)
    .flatMap(version => [...(versionKeys.get(version.version) ?? [])]));
}
function onChangeGroup() {
  var group = groupSelector.value;
  while (subGroupSelector.firstChild)
    subGroupSelector.removeChild(subGroupSelector.firstChild);

  if (group === NO_FILTER) {
    const option = document.createElement('option');
    option.value = NO_FILTER;
    option.text = '(no group selected)';
    subGroupSelector.appendChild(option);
  } else {
    subGroups[group].forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.text = name;
      subGroupSelector.appendChild(option);
    })
  }
  drawList();
}

const asGroup = (name) => {
  var div = document.createElement("span");
  div.className = 'group';
  var divName = document.createElement('span');
  divName.innerText = name;
  divName.className = 'name';
  div.appendChild(divName);

  return div;
}
const asSubGroup = name => {
  var div = document.createElement("span");
  div.className = 'subgroup';
  var divName = document.createElement('span');
  divName.innerText = name;
  divName.className = 'name';
  div.appendChild(divName);
  var divEmoji = document.createElement('span');
  divEmoji.className = 'emoji';
  div.appendChild(divEmoji);
  return div;
}
function asItem(state, key) {
  var value = emoji[key];

  var meta = byId[key] ?? { group: NO_FILTER, subGroups: NO_FILTER }
  var groupId = 0;
  var subGroupId = 0;
  const hasGroups = meta && groups.length !== 0;

  if (hasGroups) {

    if (state.group !== meta.group) {
      state.groupElement = asGroup(meta.group);
      state.items.push(state.groupElement);
      state.subGroupElement = asSubGroup(meta.subGroup);
      state.groupElement.appendChild(state.subGroupElement);
      state.group = meta.group;
      state.subGroup = meta.subGroup;
    } else if (state.subGroup !== meta.subGroup) {
      state.subGroupElement = asSubGroup(meta.subGroup);
      state.groupElement.appendChild(state.subGroupElement);
      state.subGroup = meta.subGroup;
    }

    groupId = groups.indexOf(meta.group);
    subGroupId = subGroups[meta.group].indexOf(meta.subGroup);
  }


  var div = document.createElement("div");
  div.id = key;
  div.title = meta?.shortName ?? key;
  div.classList.add(`group-${groupId}`);
  div.classList.add(`sub-group-${subGroupId}`);
  var emojiDiv = document.createElement("span");
  emojiDiv.innerText = value;
  div.appendChild(emojiDiv);

  if (hasGroups) {
    state.subGroupElement.lastChild.appendChild(div);
  } else {
    state.items.push(div);
  }

  return state;
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

  var group = groupSelector.value;
  var keys = allIds.filter(hasKeyword);
  const includedVersionKeys = getVersionKeys();
  if (includedVersionKeys) {
    keys = keys.filter(key => includedVersionKeys.has(key));
  }
  if (group !== NO_FILTER && items.length !== 0) {
    keys = keys.filter(key => items.find(item => item.key === key)?.group === group);
  }
  var subGroup = subGroupSelector.value;
  if (subGroup !== NO_FILTER && items.length !== 0) {
    keys = keys.filter(key => items.find(item => item.key === key)?.subGroup === subGroup);
  }
  skinToneCheckboxes.filter(check => {
    return check.checked
  }).forEach(check => {
    keys = keys.filter(key => items.find(
      item => item.key === key
    )?.codePoints.includes(check.value))
  });

  hairCheckboxes.filter(check => {
    return check.checked
  }).forEach(check => {
    keys = keys.filter(key => items.find(
      item => item.key === key
    )?.codePoints.includes(check.value))
  });

  emojiList.replaceChildren(...keys.reduce(asItem, {
    items: [],
    group: NO_FILTER,
    subGroup: NO_FILTER,
    groupElement: null,
    subGroupElement: null
  }).items);
  matchCount.innerText = keys.length;
}

function onKeyUp(e) {
  drawList();
}

function onClick(e, copy = true) {
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
  var group = items.find(item => item.key === id)?.group ?? '(none)';
  document.getElementsByClassName('emoji-group')[0].innerText = group;

  var subGroup = items.find(item => item.key === id)?.subGroup ?? '(none)';
  document.getElementsByClassName('emoji-subgroup')[0].innerText = subGroup;

  document.getElementsByClassName("emoji-key")[0].innerText = id;
  document.getElementsByClassName("emoji-value")[0].innerText = value;
  document.getElementsByClassName("emoji-encoded")[0].innerText = bits.join("");
  if (copy) navigator.clipboard?.writeText(id);
}
window.addEventListener("load", onLoad);
