const { Menu, MenuItem, MenuCheckBox, MenuDiv, MenuInput, MenuHr } = rarumenu;

/** @type {import('./lib/context-menu').MenuOptions} */
const options = {
    onbeforeopen: (menu) => {
        menu.items.get('div 1').setContent(`${menu.currentTarget.nodeName} ${menu.currentTarget.getAttribute('id')}`);
        menu.items.get('item1').disabled = document.getSelection().isCollapsed;
        menu.items.get('input 2').disabled = document.getSelection().isCollapsed;
        menu.items.get('time').setContent(new Date().toLocaleTimeString());
    },
    items: [
        new MenuItem({
            content: 'こんにちは',
            onclick: (menu, item) => {
                console.log('こんにちは clicked');
            }
        }),
        new MenuItem({
            content: 'せかい',
            onclick: (menu, item) => {
                console.log('せかい clicked');
            }
        }),
        new MenuItem({
            id: 'item1',
            content: 'アイテム１',
            disabled: true,
            onclick: (menu, item) => {
                console.log(`${item.id} clicked`);
            }
        }),
        new MenuHr(),
        new MenuItem({
            content: '1',
            fitContent: true,
            onclick: (menu, item) => {
                console.log('1 clicked');
            }
        }),
        new MenuItem({
            content: '2',
            fitContent: true,
            onclick: (menu, item) => {
                console.log('2 clicked');
            }
        }),
        new MenuItem({
            content: '3',
            disabled: true,
            fitContent: true,
            onclick: (menu, item) => {
                console.log('3 clicked');
            }
        }),
        new MenuHr(),
        new MenuInput({
            label: '検索',
            placeholder: '検索条件',
            onsubmit: (menu, item) => {
                console.log(`submit with value ${item.value}`);
            }
        }),
        new MenuInput({
            id: 'input 2',
            label: '検索',
            disabled: true,
            onsubmit: (menu, item) => {
                console.log(`submit ${item.id} with value ${item.value}`);
            }
        }),
        new MenuDiv({
            id: 'div 1',
            content: 'fixed text'
        }),
        new MenuCheckBox({
            disabled: true,
            content: 'check 1',
            onclick: (menu, item) => {
                console.log(`check 1 clicked: ${item.checked}`);
            }
        }),
        new MenuCheckBox({
            checked: false,
            content: 'check 2',
            onclick: (menu, item) => {
                console.log(`check 2 clicked: ${item.checked}`);
            }
        }),
        new MenuCheckBox({
            checked: true,
            content: 'check 3',
            onclick: (menu, item) => {
                console.log(`check 3 clicked: ${item.checked}`);
            }
        }),
        new MenuDiv({
            id: 'time',
            content: '',
        })
    ],
}

new Menu(document.getElementById('app'), options);
