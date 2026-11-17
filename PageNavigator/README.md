# Page Navigator（Chrome・Firefox・Safari の拡張機能）

どのページでも、長いページの中を移動しやすくする拡張機能です。ceebeedee.space の「エレベーター」「ミニマップ」「トップ／ボトムバー」「見出しのジャンプ」を、ほかのサイトでも使えるようにしたものです。

### できること

| 機能 | 使い方 |
|---|---|
| エレベーター | ページの左端に、見出しの位置を短い線で並べます。線にマウスを載せると見出しの名前、押すとその見出しへ移ります。読んでいる見出しの線は濃くなります（見出しが3つ以上・幅900px以上の画面） |
| ミニマップ | 画面の右端にマウスを寄せると、ページ全体の縮図が出ます。枠をドラッグ、または縮図を押して移動します（幅1000px以上・画面の1.5倍より長いページ） |
| 上下の帯 | スクロールしているときに画面の上端・下端へマウスを寄せると、「↑ ページの先頭へ」「↓ ページの末尾へ」の帯が出ます |
| 見出しのジャンプ | Mac は ⌘⌥↓ / ⌘⌥↑、Windows は Alt+Shift+↓ / ↑ で、次・前の見出しへ。移った見出しの名前を上に短く出します。設定で J / K も使えます（既定は切） |

- 見出しは、本文（main。なければ article、ページ全体）の h2 が2つ以上あれば h2、なければ h1〜h3 です。h2 のときは h3 を短い副の線で出します。
- 上部に固定されたヘッダーがあるページでは、見出しがヘッダーに隠れない位置で止めます。
- 文字の入力中・漢字の変換中は、キーで移動しません。
- 部品は Shadow DOM の中に作るので、ページの見た目に影響しません。

### 設定

ツールバーのアイコンを押すと、機能ごとのオン／オフと、「このサイトでは使わない」を選べます。設定は Chrome の同期（chrome.storage.sync）に保存します。

### 入れ方（開発版）

**Google Chrome**（Microsoft Edge・Arc なども同じ）
1. `chrome://extensions` を開き、右上の［デベロッパー モード］をオンにします。
2. ［パッケージ化されていない拡張機能を読み込む］を押し、このフォルダー（PageNavigator）を選びます。
3. ツールバーのパズルのアイコンから、Page Navigator をピン留めします。

**Firefox**
1. `tools/build.sh firefox` で `build/firefox/` を作ります。
2. `about:debugging#/runtime/this-firefox` を開き、［一時的なアドオンを読み込む］で `build/firefox/manifest.json` を選びます（Firefox を終了すると外れます）。

**Safari（Mac）**
1. `tools/build.sh safari` で `build/Page Navigator.app` を作ります。
2. アプリを一度開き、［終了して、Safariの設定を開く］を押します。
3. Safari の設定の「機能拡張」で Page Navigator をオンにし、「すべての Web サイト」で許可します。
4. 自分で署名したアプリなので、ほかの Mac では Safari の［開発］メニューの「未署名の機能拡張を許可」が必要です（配布するには公証が要ります）。

ファイルを書き換えたら、各ブラウザーで拡張機能を再読み込みし、開いているページも再読み込みします。

### 書き出し

`tools/build.sh`（引数なしで3つとも。`chrome`・`firefox`・`safari` で個別に）。`build/` に次のものを作ります。

| ブラウザー | 書き出すもの | 用途 |
|---|---|---|
| Chrome | `PageNavigator-chrome-版.zip` | Chrome ウェブストアへの提出 |
| Firefox | `PageNavigator-firefox-版.zip` | addons.mozilla.org への提出（manifest に Firefox 用の ID を足す） |
| Safari | `Page Navigator.app`・`PageNavigator-safari-版.zip` | Xcode のプロジェクト（`safari/`）の Resources を同期してビルド・署名 |

Chrome ウェブストアへの提出の手順・掲載情報・権限の説明は `store/LISTING.md`、スクリーンショット（1280×800）とプロモーション タイル（440×280）は `store/` にあります（スクリーンショットは `node tools/screenshots.mjs` で作り直せます）。

版は `manifest.json` の `version` だけを書き換えます（Firefox の manifest と Safari のアプリの版は、書き出すときにそろえます）。

### 制限

- ページ全体ではなく、ページの中の一部の枠だけがスクロールするサイト（Gmail・Slack などのアプリ型のサイト）では、エレベーター・ミニマップ・ジャンプが正しく働きません。
- Chrome ウェブストアのページ・`chrome://` のページでは、拡張機能は動きません。

### 更新履歴

#### 1.0.0（2026-11-18）
- 最初の版。エレベーター・ミニマップ・上下の帯・見出しのジャンプ、ポップアップの設定
- Firefox 版・Safari 版（`tools/build.sh`）。プライバシーポリシー（PRIVACY.md）
