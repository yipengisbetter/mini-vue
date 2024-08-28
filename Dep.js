class Dep {
  static target = null

  constructor() {
    this.deps = [];
  }

  addDep(watcher) {
    const idx = this.deps.findIndex(dep => dep === watcher);

    if (idx < 0) {
      this.deps.push(watcher);
    }
  }

  notify(newValue) {
    this.deps.forEach(dep => dep.notify(newValue));
  }
}

export default Dep;
