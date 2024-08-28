import Dep from './Dep.js';

class Watcher {
  constructor(vm, data, key, cb) {
    this.vm = vm;
    this.data = data;
    this.key = key;
    Dep.target = this;
    this.oldValue = data[key];
    Dep.target = null;
    this.cb = cb;

    this.cb(this.oldValue);
  }

  notify(newValue) {
    if (this.oldValue !== newValue) {
      this.oldValue = newValue;
      this.cb(newValue);
    }
  }
}

export default Watcher;
