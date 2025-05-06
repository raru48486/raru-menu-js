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

    // メニューの最上位要素を作る。
    const contextMenu = document.createElement('div');
    contextMenu.setAttribute('popover', 'auto');
    contextMenu.className = 'context-menu-root';

    // ユーザに見えて操作できる部分を作る。
    const contextMenuFrame = document.createElement('div');
    contextMenuFrame.className = 'context-menu-frame';

    // メニューアイテムを追加する。
    options.items?.forEach(i => attachMenuItem(this, contextMenuFrame, i));

    contextMenu.appendChild(contextMenuFrame);

    elm.appendChild(contextMenu);

    // ブラウザのコンテキストメニューを抑制する。
    elm.addEventListener('contextmenu', (evt) => { evt.preventDefault(); });

    // pointerupイベントをキャプチャしてコンテキストメニューを表示する。
    elm.addEventListener('pointerup', (evt) => {
      if (evt.button === 2) {
        // 以後のpointerupイベントの処理を抑制
        evt.preventDefault();

        // 一旦クリック位置にコンテキストメニューを移動。ただし、非可視の状態にしておく。
        contextMenu.style.marginLeft = `${evt.clientX}px`;
        contextMenu.style.marginTop = `${evt.clientY}px`;
        contextMenu.classList.add('prerender');

        this.currentTarget = evt.target;

        this.onbeforeopen?.(this);

        // 非可視の状態のままメニューを表示する。
        contextMenu.showPopover();

        window.requestAnimationFrame(() => {
          // メニューが表示されてから、メニューのサイズに合わせてメニューの位置を調節してから、可視状態にする。

          /** @type {HTMLHtmlElement} */
          const htmlElm = document.querySelector('html');
          if (evt.clientX + contextMenu.offsetWidth > htmlElm.clientWidth) {
            contextMenu.style.marginLeft = `${htmlElm.clientWidth - contextMenu.offsetWidth}px`;
          }
          if (evt.clientY + contextMenu.offsetHeight > htmlElm.clientHeight) {
            contextMenu.style.marginTop = `${htmlElm.clientHeight - contextMenu.offsetHeight}px`;
          }
          contextMenu.classList.remove('prerender');
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
  const id = item.id;
  if (typeof id === 'string') {
    if (menu.items.has(id)) {
      throw new Error('Duplicate IDs are not allowed.');
    }
    menu.items.set(id, item);
  }
  item.menu = menu;
  frame.appendChild(item.menuItemElement);
}

/**
 * @callback contentCallback
 * @param {any} userData
 * @returns {HTMLElement}
 */

/**
 * @typedef {Object} MenuItemOptions
 * @property {string} id
 * @property {?boolean} fitContent
 * @property {?boolean} disabled
 * @property {null|string|contentCallback} content
 * @property {any} userData
 * @property {?ClickCallback} onclick
 */

class MenuItemBase {
  /**
   * メニューのID
   * @type {?string}
   */
  id;

  /**
   * メニューアイテムの親になるコンテキストメニュー
   * @type {Menu}
   */
  menu;

  /**
   * メニューの内容を格納するHTML要素
   * @type {HTMLElement}
   */
  menuItemElement;

  /**
   * ユーザ定義のデータ
   * @type {any}
   */
  userData;

  /**
   * 
   * @param {?string} id 
   * @param {any} userData 
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
    if (value === true) {
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
    if (typeof content === 'string') {
      this.menuItemContent.innerText = content;
    } else if (typeof content === 'function') {
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
    if (value === true) {
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
 * @property {?string} id
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
    if (typeof content === 'string') {
      this.menuItemElement.innerText = content;
    } else if (typeof content === 'function') {
      this.menuItemElement.innerHTML = '';
      this.menuItemElement.appendChild(content(this.userData));
    }
  }
}

/**
 * @callback submitCallback
 * @param {Menu} menu
 * @param {MenuInput} input
 */

/**
 * @typedef {Object} MenuInputOptions
 * @property {?string} id
 * @property {string} label
 * @property {?string} value
 * @property {?boolean} disabled
 * @property {?submitCallback} onsubmit
 * @property {?string} placeholder
 * @property {any} userData
 */
export class MenuInput extends MenuItemBase {
  /** @type {submitCallback} */
  onsubmit;

  /**
   * 
   * @param {MenuInputOptions} options 
   */
  constructor(options) {
    super(options.id, options.userData);

    this.menuItemElement.className = 'context-menu-input';

    const label = document.createElement('label');
    label.innerText = options.label ?? options.id;

    const input = document.createElement('input');
    input.setAttribute('type', 'text');

    input.addEventListener('keydown', evt => {
      if (!evt.isComposing && evt.key === 'Enter') {
        evt.preventDefault();
        // キーイベントの以後の処理を抑制

        // コンテキストメニューを閉じる
        this.menu.close();

        // イベントを発行
        this.onsubmit?.(this.menu, this);
      }
    }, true);

    this.menuItemElement.appendChild(label);
    this.menuItemElement.appendChild(input);

    this.onsubmit = options.onsubmit;
    this.value = options.value;
    this.disabled = options.disabled;
    this.placeholder = options.placeholder;
  }

  get value() {
    return this.menuItemElement.querySelector('input').value;
  }

  set value(v) {
    const input = this.menuItemElement.querySelector('input');
    if (typeof v === 'string') {
      input.value = v;
    } else {
      input.value = '';
    }
  }

  get placeholder() {
    return this.menuItemElement.querySelector('input').getAttribute('placeholder');
  }

  set placeholder(v) {
    const input = this.menuItemElement.querySelector('input');
    if (typeof v === 'string') {
      input.setAttribute('placeholder', v);
    } else {
      input.removeAttribute('placeholder');
    }
  }

  /**
   * @param {boolean} value 
   */
  set disabled(value) {
    if (value === true) {
      this.menuItemElement.setAttribute('disabled', '');
      this.menuItemElement.querySelector('input').setAttribute('disabled', '');
    } else {
      this.menuItemElement.removeAttribute('disabled');
      this.menuItemElement.querySelector('input').removeAttribute('disabled');
    }
  }

  get disabled() {
    return typeof this.menuItemElement.getAttribute('disabled') === 'string';
  }
}

export class MenuHr extends MenuItemBase {
  /**
   * 
   * @param {?string} id 
   * @param {any} userData 
   */
  constructor(id, userData) {
    super(id, userData);

    this.menuItemElement.className = 'context-menu-hr';
    this.menuItemElement.appendChild(document.createElement('hr'));
  }
}