import './raru-menu.css';

/**
 * @callback OpenCallback
 * @param {Menu} menu
 */

/**
 * @callback ClickCallback
 * @param {Menu} menu
 * @param {MenuItem} item
 */

/**
 * @typedef {Object} MenuOptions
 * @property {?OpenCallback} onbeforeopen
 * @property {?MenuItemBase[]} items
 */

export class Menu {
  /** @type {HTMLElement} コンテキストメニューを設置する要素 */
  contextElement;

  /**
   * コンテキストメニューが表示される前に呼び出されるハンドラ
   * @type {OpenCallback}
   */
  onbeforeopen;

  /**
   * コンテキストメニューを開いた場所にあるノード
   * @type {Node} 
   */
  currentTarget;

  /**
   * @type {Map<string, MenuItemBase>}
   */
  items;

  /**
 * コンストラクタ
 * @param {HTMLElement} elm - コンテキストメニューを設置する要素
 * @param {MenuOptions} options
 */
  constructor(elm, options) {
    this.contextElement = elm;
    this.onbeforeopen = options.onbeforeopen;
    this.currentTarget = null;
    this.items = new Map();

    const contextMenu = document.createElement('div');
    contextMenu.setAttribute('popover', 'auto');
    contextMenu.className = 'context-menu-root';

    const contextMenuFrame = document.createElement('div');
    contextMenuFrame.className = 'context-menu-frame';

    options.items?.forEach(i => attachMenuItem(this, contextMenuFrame, i));

    contextMenu.appendChild(contextMenuFrame);

    elm.appendChild(contextMenu);

    elm.addEventListener('contextmenu', (evt) => { evt.preventDefault(); });
    elm.addEventListener('pointerup', (evt) => {
      if (evt.button === 2) {
        evt.preventDefault();

        contextMenu.style.marginLeft = `${evt.clientX}px`;
        contextMenu.style.marginTop = `${evt.clientY}px`;
        contextMenu.style.visibility = 'hidden';

        this.currentTarget = evt.target;

        this.onbeforeopen?.(this);

        contextMenu.showPopover();
        window.requestAnimationFrame(() => {
          /** @type {HTMLHtmlElement} */
          const htmlElm = document.querySelector('html');
          if (evt.clientX + contextMenu.offsetWidth > htmlElm.clientWidth) {
            contextMenu.style.marginLeft = `${htmlElm.clientWidth - contextMenu.offsetWidth}px`;
          }
          if (evt.clientY + contextMenu.offsetHeight > htmlElm.clientHeight) {
            contextMenu.style.marginTop = `${htmlElm.clientHeight - contextMenu.offsetHeight}px`;
          }
          contextMenu.style.visibility = 'visible';
        });
      }
    }, true);

    this.close = function () {
      contextMenu.hidePopover();
    }
  }
}


/**
 * 
 * @param {Menu} menu 
 * @param {HTMLElement} frame 
 * @param {MenuItemBase} item
 */
function attachMenuItem(menu, frame, item) {
  if (menu.items.has(item.id)) {
    throw new Error('Duplicate IDs are not allowed.');
  }
  item.menu = menu;
  menu.items.set(item.id, item);
  frame.appendChild(item.menuItemElement);
}

/**
 * @callback contentCallback
 * @param {any} userData
 * @returns {HTMLElement}
 */

/**
 * @typedef {Object} MenuItemOptions
 * @property {?boolean} fitContent
 * @property {?boolean} disabled
 * @property {null|string|contentCallback} content
 * @property {any} userData
 * @property {?ClickCallback} onclick
 */

class MenuItemBase {
  /**
   * @type {string}
   */
  id;

  /**
   * @type {Menu}
   */
  menu;

  /**
   * @type {HTMLElement}
   */
  menuItemElement;

  /**
   * @type {any}
   */
  userData;

  /**
   * 
   * @param {string} id 
   */
  constructor(id, userData) {
    this.id = id;
    this.userData = userData;
    this.menuItemElement = document.createElement('div');
    this.menuItemElement.className = 'context-menu-item';
  }
}

export class MenuItem extends MenuItemBase {
  /**
   * 
   * @param {MenuItemOptions} options 
   */
  constructor(options) {
    super(options.id, options.userData);

    this.menuItemContent = document.createElement('span');
    this.menuItemElement.appendChild(this.menuItemContent);

    if (typeof options.content === 'string') {
      this.menuItemContent.innerText = options.content;
    } else if (typeof options.content === 'function') {
      this.menuItemContent.appendChild = options.content(options.userData);
    } else {
      this.menuItemContent.innerText = options.id;
    }

    if (options.fitContent ?? false === true) {
      this.menuItemElement.classList.add('fit-content');
    }

    this.onclick = options.onclick;

    this.disabled = options.disabled ?? false;

    this.menuItemElement.addEventListener('click', evt => {
      // HTMLElementのclickイベントは抑制する。
      evt.stopPropagation();
    }, true)

    this.menuItemElement.addEventListener('pointerup', evt => this.prePointerUp(evt), true);

    this.menuItemElement.addEventListener('pointerup', evt => this.postPointerUp(evt));
  }

  /**
   * 
   * @param {PointerEvent} evt 
   */
  prePointerUp(evt) {
    // disableのときは以後のpointerupイベントの処理を抑制する。
    if (this.menuItemElement.hasAttribute('disabled')) {
      evt.stopPropagation();
    }
  }

  /**
   * 
   * @param {PointerEvent} evt 
   */
  postPointerUp(evt) {
    this.menu.close();
    this.onclick?.(this.menu, this);
  }

  /**
   * @param {boolean} value 
   */
  set disabled(value) {
    if (value) {
      this.menuItemElement.setAttribute('disabled', '');
    } else {
      this.menuItemElement.removeAttribute('disabled');
    }
  }

  get disabled() {
    return typeof this.menuItemElement.getAttribute('disabled') === 'string';
  }

  /**
   * 
   * @param {string|contentCallback} content 
   */
  setContent(content) {
    if(typeof content === 'string') {
      this.menuItemContent.innerText = content;
    } else if(typeof content === 'function') {
      this.menuItemContent.innerHTML = '';
      this.menuItemContent.appendChild(content(this.userData));
    }
  }
}

/**
 * @typedef {MenuItemOptions & {checked: boolean}} MenuCheckBoxOptions
 */

export class MenuCheckBox extends MenuItem {
  /**
   * @param {MenuCheckBoxOptions} options 
   */
  constructor(options) {
    super(options);

    this.menuItemElement.classList.add('checkbox');

    const check = document.createElement('span');
    check.className = 'check-mark';
    check.textContent = "\u2714";
    this.menuItemElement.insertBefore(check, this.menuItemElement.firstChild);

    this.checked = options.checked ?? false;
  }

  /**
   * @override postPointerUp
   * @param {PointerEvent} evt 
   */
  postPointerUp(evt) {
    this.checked = !this.checked;
    super.postPointerUp(evt);
  }

  /** 
   * @param {boolean} value 
   */
  set checked(value) {
    if (value) {
      this.menuItemElement.setAttribute('checked', '');
    } else {
      this.menuItemElement.removeAttribute('checked');
    }
  }

  get checked() {
    return typeof this.menuItemElement.getAttribute('checked') === 'string';
  };
}

/**
 * @typedef {Object} MenuDivOptions
 * @property {null|string|contentCallback} content
 * @property {any} userData
 */

export class MenuDiv extends MenuItemBase {
  /**
   * 
   * @param {MenuDivOptions} options 
   */
  constructor(options) {
    super(options.id, options.userData);

    this.menuItemElement.className = 'context-menu-div';

    if (typeof options.content === 'string') {
      this.menuItemElement.innerText = options.content;
    } else if (typeof options.content === 'function') {
      this.menuItemElement.appendChild = options.content(options.userData);
    } else {
      this.menuItemElement.innerText = options.id;
    }
  }

  /**
   * 
   * @param {string|contentCallback} content 
   */
  setContent(content) {
    if(typeof content === 'string') {
      this.menuItemElement.innerText = content;
    } else if(typeof content === 'function') {
      this.menuItemElement.innerHTML = '';
      this.menuItemElement.appendChild(content(this.userData));
    }
  }
}

//class ContextMenuInput extends HTMLElement {
//  static get observedAttributes() {
//    return ['label', 'value'];
//  }
//
//  constructor() {
//    super();
//    const shadowRoot = this.attachShadow({ mode: 'open' });
//    shadowRoot.adoptedStyleSheets = [contextMenuSheet];
//
//    const menuItem = document.createElement('div');
//    menuItem.className = 'context-menu-div';
//
//    const container = document.createElement('div');
//    container.className = 'context-menu-input';
//
//    const label = document.createElement('label');
//    label.setAttribute('for', 'menu-input');
//
//    const input = document.createElement('input');
//    input.setAttribute('id', 'menu-input');
//    input.setAttribute('type', 'text');
//    input.addEventListener('keydown', evt => {
//      if (!evt.isComposing && evt.key === 'Enter') {
//        evt.preventDefault();
//        // キーイベントの以後の処理を抑制
//
//        // コンテキストメニューを閉じる
//        this.contextMenu.close();
//
//        // イベントを発行
//        this.fireSubmitEvent(input.value);
//      }
//    }, true);
//
//    container.appendChild(label);
//    container.appendChild(input);
//
//    menuItem.appendChild(container);
//
//    shadowRoot.appendChild(menuItem);
//  }
//
//  fireSubmitEvent(value) {
//    const evt = new MenuEvent(
//      'submit',
//      this.contextMenu.currentTarget,
//      value
//    );
//    this.dispatchEvent(evt);
//  }
//
//  connectedCallback() {
//    this.contextMenu = getParentOf(this, 'context-menu');
//  }
//
//  attributeChangedCallback(name, oldValue, newValue) {
//    if (name === 'label') {
//      this.shadowRoot.querySelector('label').innerText = newValue;
//    } else if (name === 'value') {
//      this.shadowRoot.querySelector('input').value = newValue;
//    }
//  }
//}
//