const { Menu, MenuItem, MenuCheckBox, MenuDiv } = rarumenu;

/** @type {import('./lib/context-menu').MenuOptions} */
const options = {
    onbeforeopen: (menu) => {
        menu.items.get('div 1').setContent(`${menu.currentTarget.nodeName} ${menu.currentTarget.getAttribute('id')}`);
        menu.items.get('item1').disabled = document.getSelection().isCollapsed;
    },
    items: [
        new MenuItem({
            id: 'hello',
            content: 'こんにちは',
            onclick: (menu, item) => {
                console.log(`${item.id} clicked`);
            }
        }),
        new MenuItem({
            id: 'world',
            content: 'せかい',
            onclick: (menu, item) => {
                console.log(`${item.id} clicked`);
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
        new MenuItem({
            id: '1',
            fitContent: true,
            onclick: (menu, item) => {
                console.log(`${item.id} clicked`);
            }
        }),
        new MenuItem({
            id: '2',
            fitContent: true,
            onclick: (menu, item) => {
                console.log(`${item.id} clicked`);
            }
        }),
        new MenuItem({
            id: '3',
            disabled: true,
            fitContent: true,
            onclick: (menu, item) => {
                console.log(`${item.id} clicked`);
            }
        }),
        new MenuDiv({
            id: 'div 1',
            content: 'fixed text'
        }),
        new MenuCheckBox({
            id: 'check 1',
            disabled: true,
            onclick: (menu, item) => {
                console.log(`${item.id} clicked: ${item.checked}`);
            }
        }),
        new MenuCheckBox({
            id: 'check 2',
            checked: false,
            onclick: (menu, item) => {
                console.log(`${item.id} clicked: ${item.checked}`);
            }
        }),
        new MenuCheckBox({
            id: 'check 3',
            checked: true,
            onclick: (menu, item) => {
                console.log(`${item.id} clicked: ${item.checked}`);
            }
        }),
    ],
}

new Menu(document.getElementById('app'), options);
