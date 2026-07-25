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
};

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

export function ensureImportExamples(dialog: MinimalNode) {
  const code = dialog.querySelector('.code');
  const importLine = code?.querySelector('.line');
  const importString = importLine?.querySelector('.string');
  if (!code || !importLine || !importString) return;

  let allPath = importString.querySelector('.emoji-import-path');
  if (!allPath) {
    allPath = document.createElement('span');
    allPath.className = 'emoji-import-path';
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
    let line = code.querySelector(`.${lineClass}`);
    if (!line) {
      line = document.createElement('span');
      line.className = `line comment ${lineClass}`;
      line.hidden = true;
      line.append(
        '// import emoji from "',
        Object.assign(document.createElement('span'), { className: pathClass }),
        '";'
      );
      after.after(line);
    }
    after = line;
  });
}
