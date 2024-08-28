import Dep from './Dep.js';

class Observer {
  constructor(vm, data) {
    this.vm = vm;
    this.data = data;

    this.observe();
  }

  observe() {
    const self = this;
    Object.keys(this.data).forEach(key => {
      const dep = new Dep();
      let v = this.data[key];
      Object.defineProperty(this.data, key, {
        get() {
          if (Dep.target) {
            dep.addDep(Dep.target);
          }

          return v;
        },
        set(newValue) {
          v = newValue;
          dep.notify(newValue);

          return newValue;
        }
      });
    });
  }
}

export default Observer;
