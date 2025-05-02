const { Menu, MenuItem, MenuCheckBox } = rarumenu;

/** @type {import('./lib/context-menu').MenuOptions} */
const options = {
    onbeforeopen: (menu) => {
        console.log('before open');
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
        new MenuCheckBox({
            id: 'check 1',
            checked: false,
            disabled: true,
            onclick: (menu, item) => {
                console.log(`${item.id} clicked: ${item.checked}`);
            }
        }),
    ],
}

new Menu(document.getElementById('app'), options);
