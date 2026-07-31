export class FakeClassList {
  classes = new Set<string>();

  add(name: string) {
    this.classes.add(name);
  }

  remove(name: string) {
    this.classes.delete(name);
  }

  toggle(name: string, force?: boolean) {
    const shouldAdd = force === undefined ? !this.classes.has(name) : force;
    if (shouldAdd) this.classes.add(name);
    else this.classes.delete(name);
  }

  has(name: string) {
    return this.classes.has(name);
  }
}

export class FakeField {
  hidden = false;
  classList = new FakeClassList();
}

export class FakeOutput {
  value = "";
  classList = new FakeClassList();
}

export class FakeButton {
  disabled = false;
}

export class FakeRange {
  disabled = false;
  max = "";
  value = "";
  attributes = new Map<string, string>();
  styleCalls: Array<[string, string]> = [];
  style = {
    setProperty: (name: string, value: string) => {
      this.styleCalls.push([name, value]);
    },
  };

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
}

export class FakeSelect {
  disabled = false;
  value = "";
  options: Array<{ value: string; text?: string }> = [];
  field = new FakeField();

  closest(selector: string) {
    return selector === ".filter-field" ? this.field : null;
  }
}
