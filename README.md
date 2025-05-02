# raru-menu-js

一階層のみの簡易的なコンテキストメニュー

## 使い方

HTMLでJSとCSSを読み込む。

``` HTML
<link rel="stylesheet" href="dist/raru-menu.css"/>
<script src="dist/raru-menu.umd.js"></script>

<!-- コンテキストメニューを付与する要素 -->
<div id="app"></div>
```

JSでメニューを生成する。

``` JS
const options = {
    onbeforeopen: (menu) => {　// メニューが表示される前にイベントを発生させることができる。
        // メニューアイテムのコンストラクタにidプロパティを指定すると、idでメニュー項目を取得可能
        menu.items.get('time').setContent(new Date().toLocaleTimeString());
    },
    items: [
        new MenuItem({ // メニュー項目
            content: 'こんにちは', // メニューの内容は文字列またはHTML要素を返す関数で指定。
            onclick: (menu, item) => { // クリックイベント
                console.log('こんにちは clicked');
            }
        }),
        new MenuItem({
            content: 'アイテム１',
            disabled: true, // 非活性化。MenuInput、MenuCheckBoxも同様
        }),
        new MenuHr(), //  水平線
        new MenuInput({ // メニュー上にテキスト入力項目を設置
            label: '検索',
            placeholder: '検索条件',
            onsubmit: (menu, item) => {
                // テキスト入力でEnterを押下するとメニューを閉じたうえでイベントが発生
                console.log(`submit with value ${item.value}`);
            }
        }),
        new MenuDiv({ // ユーザが編集できない文字列
            content: 'fixed text'
        }),
        new MenuCheckBox({ // チェックボックス
            content: 'check 1',
            onclick: (menu, item) => {
                console.log(`check 1 clicked: ${item.checked}`);
            }
        }),
        new MenuDiv({
            id: 'time',
        }),
    ],
}

new Menu(document.getElementById('app'), options);
```

メニューに配置できるものは以下の通り。

* メニュー項目
* チェックボックス
* テキスト入力
* 水平線
* 固定テキスト

