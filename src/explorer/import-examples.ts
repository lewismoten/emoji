export type PackageManifest = {
  packs: Array<{
    id: string;
    importPath: string;
    keys?: string[];
  }>;
  categories: Array<{
    label: string;
    importPath: string;
    subcategories: Array<{
      unicodeSubgroup: string;
      importPath: string;
    }>;
  }>;
};

export type ImportExampleResult = {
  allPath: string;
  popularPath: string;
  showPopular: boolean;
  categoryPath: string;
  showCategory: boolean;
  subgroupPath: string;
  showSubgroup: boolean;
};

type MinimalNode = {
  className: string;
  hidden: boolean;
  querySelector(selector: string): MinimalNode | null;
  querySelectorAll(selector: string): Iterable<MinimalNode>;
  replaceChildren(...nodes: unknown[]): void;
  textContent: string | null;
  after(...nodes: unknown[]): void;
  append(...nodes: unknown[]): void;
};

declare const document: {
  createElement(tagName: string): MinimalNode;
  querySelector(selector: string): MinimalNode | null;
};

function createSpan(className: string) {
  const span = document.createElement('span');
  span.className = className;
  return span;
}

function ensureImportExampleLine(
  code: MinimalNode,
  after: MinimalNode,
  lineClass: string,
  pathClass: string
) {
  let line = code.querySelector(`.${lineClass}`);
  if (!line) {
    line = createSpan(`line comment ${lineClass}`);
    line.hidden = true;
    line.append('// import emoji from "', createSpan(pathClass), '";');
    after.after(line);
  }
  return line;
}

export function resolveImportExamples(
  packageManifest: PackageManifest,
  item: {
    key: string;
    group: string;
    unicodeSubGroup: string;
  }
): ImportExampleResult {
  const popular = packageManifest.packs.find(pack => pack.id === 'popular');
  const allPath =
    packageManifest.packs.find(pack => pack.id === 'all')?.importPath ??
    '@lewismoten/emoji/all';
  const category = packageManifest.categories.find(
    entry => entry.label === item.group
  );
  const subcategory = category?.subcategories.find(
    entry => entry.unicodeSubgroup === item.unicodeSubGroup
  );
  const showPopular = popular?.keys?.includes(item.key) ?? false;
  return {
    allPath,
    popularPath: showPopular ? (popular?.importPath ?? '') : '',
    showPopular,
    categoryPath: category?.importPath ?? '',
    showCategory: Boolean(category),
    subgroupPath: subcategory?.importPath ?? '',
    showSubgroup: Boolean(subcategory)
  };
}

export function getCodeExampleText(dialog: MinimalNode) {
  return Array.from(dialog.querySelectorAll('.code .line'))
    .filter(line => !(line as { hidden?: boolean }).hidden)
    .map(line => line.textContent)
    .join('\n');
}

export function renderImportExamples(
  packageManifest: PackageManifest,
  item: { key: string; group: string; unicodeSubGroup: string }
) {
  const examples = resolveImportExamples(packageManifest, item);
  const set = (
    lineClass: string,
    pathClass: string,
    visible: boolean,
    value: string
  ) => {
    const line = document.querySelector(`.${lineClass}`);
    const path = document.querySelector(`.${pathClass}`);
    if (!line || !path) return;
    line.hidden = !visible;
    path.textContent = value;
  };
  const allPath = document.querySelector('.emoji-import-path');
  if (allPath) allPath.textContent = examples.allPath;
  set(
    'emoji-popular-import',
    'emoji-popular-import-path',
    examples.showPopular,
    examples.popularPath
  );
  set(
    'emoji-category-import',
    'emoji-category-import-path',
    examples.showCategory,
    examples.categoryPath
  );
  set(
    'emoji-subgroup-import',
    'emoji-subgroup-import-path',
    examples.showSubgroup,
    examples.subgroupPath
  );
}

export function ensureImportExamples(dialog: MinimalNode) {
  const code = dialog.querySelector('.code');
  const importLine = code?.querySelector('.line');
  const importString = importLine?.querySelector('.string');
  if (!code || !importLine || !importString) return;

  let allPath = importString.querySelector('.emoji-import-path');
  if (!allPath) {
    allPath = createSpan('emoji-import-path');
    importString.replaceChildren('"', allPath, '"');
  }
  allPath.textContent = '@lewismoten/emoji/all';

  const alternatives = [
    ['emoji-popular-import', 'emoji-popular-import-path'],
    ['emoji-category-import', 'emoji-category-import-path'],
    ['emoji-subgroup-import', 'emoji-subgroup-import-path']
  ];
  let after = importLine;
  alternatives.forEach(([lineClass, pathClass]) => {
    after = ensureImportExampleLine(code, after, lineClass, pathClass);
  });
}
