import emoji from './dist/esm/index.js';

var items = [];
var groups = [];
var subGroups = {};
const NO_FILTER = 'Not applied';
var emojiByKey = { ...emoji };
var allIds = Object.keys(emojiByKey);
var releasedIds = new Set(allIds);
var groupedKeys = {};
var byId = {};

var searchText;
var emojiList;
var matchCount;
var toolbar;
var groupSelector;
var subGroupSelector;
var versionModeSelector;
var versionSelector;
var advancedFilters;
var futureReleaseButton;
var exampleDialog;
var skinToneCheckboxes;
var hairCheckboxes;
var versionManifests = [];
var proposedVersionManifests = [];
var versionKeys = new Map();

const countryContinents = {
  Africa: new Set('DZ AO BJ BW BF BI CV CM CF TD KM CD CG CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW'.split(' ')),
  Asia: new Set('AF AM AZ BH BD BT BN KH CN CY GE IN ID IR IQ IL JP JO KZ KW KG LA LB MY MV MN MM NP KP OM PK PH QA SA SG KR LK SY TW TJ TH TL TR TM AE UZ VN YE'.split(' ')),
  Europe: new Set('AL AD AT BY BE BA BG HR CZ DK EE FI FR DE GR HU IS IE IT XK LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA GB VA'.split(' ')),
  'North America': new Set('AG BS BB BZ CA CR CU DM DO SV GD GT HT HN JM MX NI PA KN LC VC TT US'.split(' ')),
  'South America': new Set('AR BO BR CL CO EC GY PY PE SR UY VE'.split(' ')),
  Oceania: new Set('AU FJ KI MH FM NR NZ PW PG WS SB TO TV VU'.split(' '))
};

function getExplorerSubGroup(item) {
  const name = item.shortName.toLowerCase();
  const raw = item.subGroup;

  if (raw === 'country-flag') return getFlagContinent(item) ?? 'Other Flags';
  if (raw === 'animal-bug') return 'Bugs';
  if (raw === 'animal-bird') return 'Birds';
  if (raw === 'animal-mammal') return 'Mammals';
  if (raw === 'animal-marine') return 'Marine Animals';
  if (raw === 'animal-reptile') return 'Reptiles';
  if (raw === 'animal-amphibian') return 'Amphibians';
  if (raw === 'plant-flower') return 'Flowers';
  if (raw === 'plant-other') return 'Other Plants';
  if (raw === 'book-paper') return 'Books & Paper';
  if (raw === 'food-asian') return 'Asian';
  if (raw.startsWith('food-')) return titleCase(raw.slice(5));
  if (raw === 'clothing') return getClothingType(name);
  if (raw === 'geometric') return getGeometricShape(name);
  if (raw === 'family') return getFamilyType(name);
  if (raw === 'person') return /baby|boy|girl|child/.test(name) ? 'Children' : 'Adults';
  if (raw === 'person-role') return getPersonRoleType(name);
  if (raw === 'person-activity') return getActivityType(name);
  if (raw === 'person-fantasy') return getFantasyType(name);
  if (raw === 'person-gesture') return getGestureType(name);
  if (raw === 'person-sport') return getSportType(name);

  return titleCase(raw);
}

function titleCase(value) {
  return value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getFlagContinent(item) {
  const code = [...item.emoji]
    .filter(character => {
      const point = character.codePointAt(0);
      return point >= 0x1F1E6 && point <= 0x1F1FF;
    })
    .map(character => String.fromCharCode(65 + character.codePointAt(0) - 0x1F1E6))
    .join('');

  return Object.entries(countryContinents).find(([, countries]) => countries.has(code))?.[0];
}

function getClothingType(name) {
  if (/shoe|boot|sandal|slipper/.test(name)) return 'Shoes';
  if (/cap|crown|helmet|hat|headscarf|hair pick/.test(name)) return 'Hats & Headwear';
  if (/bag|purse|glasses|goggles|gloves|necktie|lipstick|fan|beads|gem/.test(name)) return 'Accessories';
  return 'Clothing';
}

function getGeometricShape(name) {
  if (name.includes('circle')) return 'Circles';
  if (name.includes('square')) return 'Squares';
  if (name.includes('diamond')) return 'Diamonds';
  if (name.includes('triangle')) return 'Triangles';
  return 'Other Shapes';
}

function getFamilyType(name) {
  if (name.startsWith('family')) return 'Families';
  if (name.startsWith('kiss')) return 'Kissing Couples';
  if (name.startsWith('couple with heart')) return 'Couples with Heart';
  return 'Holding Hands';
}

function getPersonRoleType(name) {
  if (/health worker|feeding baby|pregnant|breast-feeding/.test(name)) return 'Care & Health';
  if (/artist|singer|scientist|technologist/.test(name)) return 'Creative & Technical';
  if (/student|teacher|office worker/.test(name)) return 'Education & Office';
  if (/detective|firefighter|guard|judge|police officer|ninja/.test(name)) return 'Safety & Justice';
  if (/construction|cook|factory|farmer|mechanic/.test(name)) return 'Trades & Service';
  if (/astronaut|pilot/.test(name)) return 'Travel & Space';
  if (/prince|princess|crown/.test(name)) return 'Royalty';
  return 'Cultural & Formal Wear';
}

function getActivityType(name) {
  if (/wheelchair|white cane/.test(name)) return 'Accessibility & Mobility';
  if (/haircut|massage|steamy room/.test(name)) return 'Personal Care & Rest';
  if (/dancing|bunny ears|ballet/.test(name)) return 'Dance';
  if (/kneeling|standing|levitating/.test(name)) return 'Poses';
  return 'Movement';
}

function getFantasyType(name) {
  if (/santa|claus|angel/.test(name)) return 'Holiday & Angels';
  if (/elf|fairy|genie|mage/.test(name)) return 'Magic';
  if (/superhero|supervillain/.test(name)) return 'Heroes & Villains';
  if (/mermaid|merman|merperson/.test(name)) return 'Merpeople';
  return 'Monsters & Undead';
}

function getGestureType(name) {
  if (name.startsWith('deaf')) return 'Accessibility';
  if (/raising hand|gesturing|tipping hand/.test(name)) return 'Signals & Greetings';
  if (/facepalming|frowning|pouting|shrugging/.test(name)) return 'Reactions';
  return 'Respect & Apology';
}

function getSportType(name) {
  if (/swimming|surfing|rowing|water polo/.test(name)) return 'Water Sports';
  if (/biking|mountain biking/.test(name)) return 'Cycling';
  if (/bouncing ball|handball|golfing/.test(name)) return 'Ball Sports';
  if (/lifting weights|cartwheeling|juggling/.test(name)) return 'Fitness & Skills';
  if (/ski|snowboard/.test(name)) return 'Winter Sports';
  if (/wrestling|fencing|horse racing/.test(name)) return 'Competition';
  return 'Running & Movement';
}

function onLoad() {
  searchText = document.getElementsByClassName("text")[0];
  emojiList = document.getElementsByClassName("list")[0];
  matchCount = document.getElementsByClassName('match-count')[0];
  toolbar = document.getElementsByClassName('toolbar')[0];
  groupSelector = document.getElementsByClassName('select-group')[0];
  subGroupSelector = document.getElementsByClassName('select-subgroup')[0];
  versionModeSelector = document.getElementsByClassName('select-version-mode')[0];
  versionSelector = document.getElementsByClassName('select-version')[0];
  advancedFilters = document.getElementsByClassName('advanced-filters')[0];
  futureReleaseButton = document.getElementsByClassName('future-release')[0];
  exampleDialog = document.getElementsByClassName('example-dialog')[0];
  skinToneCheckboxes = Array.from(document.getElementsByClassName('skin-tone'));
  hairCheckboxes = Array.from(document.getElementsByClassName('hair'));

  skinToneCheckboxes.forEach(checkbox => checkbox.addEventListener('change', drawList));
  hairCheckboxes.forEach(checkbox => checkbox.addEventListener('change', drawList));

  searchText.addEventListener("keyup", onKeyUp);
  emojiList.addEventListener("click", onClick);
  versionModeSelector.addEventListener('change', onVersionFilterChange);
  versionSelector.addEventListener('change', drawList);
  futureReleaseButton.addEventListener('click', showLatestFutureRelease);

  const setToolbarHeight = () => {
    document.documentElement.style.setProperty('--toolbar-height', `${toolbar.offsetHeight}px`);
  };
  setToolbarHeight();
  if (window.ResizeObserver) {
    new window.ResizeObserver(setToolbarHeight).observe(toolbar);
  } else {
    window.addEventListener('resize', setToolbarHeight);
  }

  if (window.matchMedia('(max-width: 560px)').matches) {
    advancedFilters.open = false;
  }

  loadData();

  drawList();
}

async function loadData() {
  const data = await fetch('emoji.json').then(response => response.json());

  // Keep Unicode's group/subgroup taxonomy, then add a smaller explorer section
  // inside each Unicode subgroup for large collections.
  items = data.map(item => ({
    ...item,
    unicodeSubGroup: item.subGroup,
    subGroup: getExplorerSubGroup(item)
  }));
  const explorerSectionCounts = items.reduce((counts, item) => {
    const key = `${item.group}:${item.unicodeSubGroup}`;
    if (!counts.has(key)) counts.set(key, new Set());
    counts.get(key).add(item.subGroup);
    return counts;
  }, new Map());
  items.forEach(item => {
    item.hasExplorerSections = explorerSectionCounts
      .get(`${item.group}:${item.unicodeSubGroup}`)
      .size > 1;
  });
      byId = items.reduce((byId, item) => ({ ...byId, [item.key]: item }), {});

      groups = items
        .reduce((all, item) => all.includes(item.group) ? all : [...all, item.group], [])
        .sort();

      subGroups = items.reduce((all, { group, unicodeSubGroup }) => {
        if (!all[group]) all[group] = [];
        if (!all[group].includes(unicodeSubGroup)) {
          all[group].push(unicodeSubGroup);
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
        option.text = name === NO_FILTER ? name : `${getGroupRepresentativeEmoji(name)} ${name}`;
        groupSelector.appendChild(option);
      });
      // Replacing the placeholder options can leave a browser holding on to its
      // old value ("Not loaded"). Reset to an unfiltered state before drawing.
      groupSelector.value = NO_FILTER;
      versionModeSelector.value = 'all';
      groupSelector.addEventListener('change', onChangeGroup);
      subGroupSelector.addEventListener('change', drawList)

      allIds = [];
      // Sort keys by Unicode group and subgroup, then by explorer section.
      groups.forEach(group => {
        if (group === NO_FILTER) return;
        groupedKeys[group] = {};
        subGroups[group].forEach(unicodeSubGroup => {
          if (unicodeSubGroup === NO_FILTER) return;
          groupedKeys[group][unicodeSubGroup] = [];
          const subgroupItems = items.filter(item =>
            item.group === group && item.unicodeSubGroup === unicodeSubGroup
          );
          const explorerSections = [...new Set(subgroupItems.map(item => item.subGroup))].sort();
          explorerSections.forEach(section => {
            subgroupItems.filter(item => item.subGroup === section).forEach(item => {
              allIds.push(item.key);
              groupedKeys[group][unicodeSubGroup].push(item.key);
            });
          });
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
    const proposed = (manifest.proposed ?? []).sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }));
    const proposedKeys = await Promise.all(proposed.map(async version => {
      const proposal = await fetch(version.file).then(response => response.json());
      const proposalItems = proposal.emoji ?? [];
      proposalItems.forEach(item => {
        if (emojiByKey[item.key]) return;
        const explorerItem = {
          ...item,
          unicodeSubGroup: item.subGroup,
          subGroup: getExplorerSubGroup(item)
        };
        items.push(explorerItem);
        byId[item.key] = explorerItem;
        emojiByKey[item.key] = item.emoji;
        allIds.push(item.key);
      });
      return [version.version, new Set(proposalItems.map(item => item.key))];
    }));

    versionManifests = manifests;
    proposedVersionManifests = proposed;
    versionKeys = new Map([...keys, ...proposedKeys]);
    populateVersionSelector();
    updateFutureReleaseButton();
    drawList();
  } catch (error) {
    console.warn('Version filters unavailable', error);
    versionModeSelector.disabled = true;
    versionSelector.disabled = true;
  }
}

function updateFutureReleaseButton() {
  const latest = proposedVersionManifests.at(-1);
  if (!latest) return;
  const stage = latest.stage ?? latest.status ?? 'draft';
  const label = `Emoji ${latest.version} ${stage}`;
  const timing = latest.expectedRelease ? `expected ${latest.expectedRelease}` : '';
  const name = document.createElement('span');
  name.textContent = `✨ ${label}`;
  const releaseTiming = document.createElement('span');
  releaseTiming.className = 'future-release-timing';
  releaseTiming.textContent = timing ? ` · ${timing}` : '';
  futureReleaseButton.replaceChildren(name, releaseTiming);
  futureReleaseButton.setAttribute('aria-label', `Show only ${label} candidates${timing ? `, ${timing}` : ''}`);
  futureReleaseButton.title = futureReleaseButton.getAttribute('aria-label');
  futureReleaseButton.hidden = false;
}

function showLatestFutureRelease() {
  const latest = proposedVersionManifests.at(-1);
  if (!latest) return;
  versionModeSelector.value = 'future-selected';
  populateVersionSelector();
  versionSelector.value = latest.version;
  drawList();
}

function populateVersionSelector() {
  versionSelector.replaceChildren();
  const futureMode = versionModeSelector.value.startsWith('future');
  const manifests = futureMode ? proposedVersionManifests : versionManifests;
  manifests.forEach(version => {
    const option = document.createElement('option');
    option.value = version.version;
    if (futureMode) {
      const stage = version.stage ?? version.status ?? 'draft';
      const timing = version.expectedRelease
        ? `expected ${version.expectedRelease}`
        : `updated ${new Date(version.retrieved).toLocaleDateString()}`;
      option.text = `Emoji ${version.version} (${stage} · ${timing})`;
    } else {
      option.text = `Emoji ${version.version} (${version.released})`;
    }
    versionSelector.appendChild(option);
  });
  versionSelector.value = manifests.at(-1)?.version ?? '';
  versionSelector.disabled = versionModeSelector.value === 'all' || versionModeSelector.value === 'future';
}

function onVersionFilterChange() {
  populateVersionSelector();
  drawList();
}

function getVersionKeys() {
  if (versionModeSelector.value === 'all') return releasedIds;
  if (versionModeSelector.value === 'future') {
    return new Set([
      ...releasedIds,
      ...proposedVersionManifests.flatMap(version => [...(versionKeys.get(version.version) ?? [])])
    ]);
  }
  if (versionModeSelector.value === 'selected' || versionModeSelector.value === 'future-selected') {
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
      option.text = name === NO_FILTER
        ? '(all sub-groups)'
        : `${getSubGroupRepresentativeEmoji(group, name)} ${displayUnicodeSubGroupName(name)}`;
      subGroupSelector.appendChild(option);
    })
  }
  drawList();
}

function getGroupRepresentativeEmoji(group) {
  const firstSubGroupWithMultipleEmoji = subGroups[group]
    .filter(name => name !== NO_FILTER)
    .find(name => items.filter(item => item.group === group && item.unicodeSubGroup === name).length > 1);
  const subgroupItems = items.filter(item =>
    item.group === group && item.unicodeSubGroup === firstSubGroupWithMultipleEmoji
  );
  return subgroupItems[1]?.emoji ?? subgroupItems[0]?.emoji ?? '';
}

function getSubGroupRepresentativeEmoji(group, subGroup) {
  return items.find(item => item.group === group && item.unicodeSubGroup === subGroup)?.emoji ?? '';
}

function displayUnicodeSubGroupName(name) {
  const conciseNames = {
    'animal-amphibian': 'Amphibians',
    'animal-bird': 'Birds',
    'animal-bug': 'Bugs',
    'animal-mammal': 'Mammals',
    'animal-marine': 'Marine Animals',
    'animal-reptile': 'Reptiles',
    'plant-flower': 'Flowers',
    'plant-other': 'Other Plants',
    'book-paper': 'Books & Paper'
  };
  if (name.startsWith('food-')) return titleCase(name.slice(5));
  if (conciseNames[name]) return conciseNames[name];
  return titleCase(name);
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
const asUnicodeSubGroup = name => {
  var div = document.createElement("section");
  div.className = 'unicode-subgroup';
  var divName = document.createElement('span');
  divName.innerText = displayUnicodeSubGroupName(name);
  divName.className = 'name';
  div.appendChild(divName);
  var divSections = document.createElement('span');
  divSections.className = 'subgroup-list';
  div.appendChild(divSections);
  return div;
}
const asSubGroup = (name, direct) => {
  var div = document.createElement("span");
  div.className = direct ? 'subgroup is-direct' : 'subgroup';
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
  var value = emojiByKey[key];

  var meta = byId[key] ?? { group: NO_FILTER, subGroups: NO_FILTER }
  var groupId = 0;
  var subGroupId = 0;
  const hasGroups = meta && groups.length !== 0;

  if (hasGroups) {

    if (state.group !== meta.group) {
      state.groupElement = asGroup(meta.group);
      state.items.push(state.groupElement);
      state.unicodeSubGroupElement = asUnicodeSubGroup(meta.unicodeSubGroup);
      state.groupElement.appendChild(state.unicodeSubGroupElement);
      state.subGroupElement = asSubGroup(meta.subGroup, !meta.hasExplorerSections);
      state.unicodeSubGroupElement.lastChild.appendChild(state.subGroupElement);
      state.group = meta.group;
      state.unicodeSubGroup = meta.unicodeSubGroup;
      state.subGroup = meta.subGroup;
    } else if (state.unicodeSubGroup !== meta.unicodeSubGroup) {
      state.unicodeSubGroupElement = asUnicodeSubGroup(meta.unicodeSubGroup);
      state.groupElement.appendChild(state.unicodeSubGroupElement);
      state.subGroupElement = asSubGroup(meta.subGroup, !meta.hasExplorerSections);
      state.unicodeSubGroupElement.lastChild.appendChild(state.subGroupElement);
      state.unicodeSubGroup = meta.unicodeSubGroup;
      state.subGroup = meta.subGroup;
    } else if (state.subGroup !== meta.subGroup) {
      state.subGroupElement = asSubGroup(meta.subGroup, !meta.hasExplorerSections);
      state.unicodeSubGroupElement.lastChild.appendChild(state.subGroupElement);
      state.subGroup = meta.subGroup;
    }

    groupId = groups.indexOf(meta.group);
    subGroupId = subGroups[meta.group]?.indexOf(meta.unicodeSubGroup) ?? 0;
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
    keys = keys.filter(key => items.find(item => item.key === key)?.unicodeSubGroup === subGroup);
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
    unicodeSubGroup: NO_FILTER,
    subGroup: NO_FILTER,
    groupElement: null,
    unicodeSubGroupElement: null,
    subGroupElement: null
  }).items);
  matchCount.innerText = keys.length.toLocaleString();
}

function onKeyUp(e) {
  drawList();
}

function onClick(e, copy = true) {
  var id = e.target.id;
  if ((id || "") === "") id = e.target.parentElement.id;
  var value = emojiByKey[id];
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

  var subGroup = items.find(item => item.key === id)?.unicodeSubGroup ?? '(none)';
  document.getElementsByClassName('emoji-subgroup')[0].innerText = displayUnicodeSubGroupName(subGroup);

  document.getElementsByClassName("emoji-key")[0].innerText = id;
  document.getElementsByClassName("emoji-value")[0].innerText = value;
  document.getElementsByClassName("emoji-encoded")[0].innerText = bits.join("");
  if (copy) {
    navigator.clipboard?.writeText(id);
    exampleDialog.showModal();
  }
}
window.addEventListener("load", onLoad);
