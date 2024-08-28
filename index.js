import Compiler from './Compiler.js';
import Observer from './Observer.js';

const f = () => {};

class Vue {
  constructor(options = {}) {
    const {
      el = '',
      data = f,
      methods = {},
      template =''
    } = options;

    this.el = el;
    this.data = data();
    this.methods = methods;
    this.template = template;

    // 数据劫持
    new Observer(this, this.data);

    // 代理
    this.proxy(this.data, this.methods);

    // 模板编译
    this.fragment = new Compiler(this, this.template);

    this.$mount();
  }

  proxy(data, methods) {
    this.proxyData(data);
    this.proxyMethods(methods);
  }

  proxyData(data) {
    Object.keys(data).forEach((key) => {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        },
        set(newValue) {
          data[key] = newValue;

          return newValue;
        }
      });
    });
  }

  proxyMethods(methods) {
    Object.keys(methods).forEach((key) => {
      methods[key] = methods[key].bind(this);
      Object.defineProperty(this, key, {
        value: methods[key],
        writable: false
      });
    });
  }

  $mount() {
    const el = document.querySelector(this.el);

    if (!!el) {
      el.appendChild(this.fragment.content);
    }
  }
}

new Vue({
  el: "#app",
  data() {
    return {
      msg: "hello world",
      msg2: "hello world2",
      count: 0,
      count2: 0,
      'msg-html': "<p style='color: red'>red msg for html</p>"
    }
  },
  methods: {
    addCount() {
      this.count ++;
    },
    addCount2() {
      this.count2 ++;
    }
  },
  template: `
    {{ msg }}
    {{ msg2 }}
    <p id="test-{{}}">
      {{ msg }}
       {{ msg2 }}
    </p>
    <p id="test-v-text" v-text="msg"></p>
    <input id="test-v-model" v-model="msg" />
    <input v-model="msg2" />
    <p id="test-v-html" v-html="msg-html"></p>
    <p>
      {{ count }}
      {{ count2 }}
    </p>
    <button id="test-v-on" v-on:click="addCount">add count</button>
    <button v-on:click="addCount2">add count2</button>
  `
})

export default Vue;
