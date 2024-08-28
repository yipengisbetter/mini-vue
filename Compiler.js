import Watcher from './Watcher.js';

class Compiler {
  compileTextRegexp = /\{\{([^\}\}]+)\}\}/g

  compileOptions = {
    '{{}}'(textNode, vm, data, key) {
      new Watcher(vm, data, key, (newValue) => {
        textNode.textContent = newValue;
      });
    },
    'v-text'(elementNode, vm, data, key) {
      new Watcher(vm, data, key, (newValue) => {
        elementNode.textContent = newValue;
      });
    },
    'v-html'(elementNode, vm, data, key) {
      new Watcher(vm, data, key, (newValue) => {
        elementNode.innerHTML = newValue;
      });
    },
    'v-model'(elementNode, vm, data, key) {
      new Watcher(vm, data, key, (newValue) => {
        elementNode.value = newValue;
      });
      const tagNameLowerCased = elementNode.tagName.toLowerCase();
      if (tagNameLowerCased === 'input' || tagNameLowerCased === 'textarea') {
        elementNode.addEventListener('input', (e) => {
          data[key] = e.target.value;
        }, false);
      }
    },
    'v-on'(elementNode, vm, methods, key, attribute) {
      elementNode.addEventListener(attribute.slice(5), methods[key], false);
    }
  }

  constructor(vm, template) {
    this.vm = vm;
    this.data = vm.data;
    this.methods = vm.methods;
    this.template = template;

    this.compile();

    return this.fragment;
  }

  compile() {
    this.fragment = this.createFragmentFromTemplate();

    this.judgeChildNodes(this.fragment.content.childNodes);
  }

  judgeChildNodes(childNodes = []) {
    for (const childNode of childNodes) {
      const { nodeType } = childNode;

      if (nodeType === 1) {
        // 元素
        this.compileElement(childNode)
      } else if (nodeType === 3) {
        // text
        this.compileText(childNode)
      }

      this.judgeChildNodes(childNode.childNodes)
    }
  }

  isDerective(attribute) {
    return /^v-/.test(attribute);
  }

  isOnDerective(attribute) {
    return /^v-on/.test(attribute);
  }

  compileElement(elementNode) {
    const { attributes } = elementNode;
    for (const attribute of attributes) {
      if (this.isDerective(attribute.name)) {
        const { data, methods } = this;
        const key = elementNode.getAttribute(attribute.name);
        if (this.isOnDerective(attribute.name)) {
          this.compileOptions['v-on'](elementNode, this.vm, methods, key, attribute.name);
        } else {
          this.compileOptions[attribute.name](elementNode, this.vm, data, key);
        }
      }
    }
  }

  compileText(textNode) {
    const { textContent } = textNode;
    const { vm, data, compileTextRegexp } = this;
    // textContent.replace(compileTextRegexp, ($, $1) => {
    //   const key = $1.trim();
    //   this.compileOptions['{{}}'](textNode, vm, data, key);
    // });
    let started = false;
    let startI = 0;
    let endI = 0;
    let lastI = 0;
    let idx = -1;
    const arr = [];
    for(let i = 0; i < textContent.length; i++) {
      const iContent = textContent[i];
      const iiContent = textContent[i + 1];

      if (!started && iContent === '{' && iiContent === '{') {
        started = true;
        startI = i;
      }

      if (started && iContent === '}' && iiContent === '}') {
        started = false;
        endI = i + 2;
        arr.push(textContent.slice(lastI, startI))
        arr.push(textContent.slice(startI, endI));
        lastI = endI;

        const curIdx = idx += 2;
        const key = arr[curIdx].slice(2, -2).trim();
        console.log(key);

        new Watcher(vm, data, key, newValue => {
          arr[curIdx] = newValue;
          textNode.textContent = arr.join('');
        });
      }
    }
  }

  createFragmentFromTemplate() {
    const fragment = document.createElement('template');
    fragment.innerHTML = this.template;

    return fragment;
  }
}

export default Compiler;
