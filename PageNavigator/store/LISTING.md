# Chrome ウェブストアへの提出（Page Navigator）

提出する zip は `tools/build.sh chrome` で作る `build/PageNavigator-chrome-版.zip`。画像は `store/` にある（作り直すときは `node tools/screenshots.mjs`）。

### 手順

1. Chrome ウェブストア デベロッパー ダッシュボード（https://chrome.google.com/webstore/devconsole ）で、開発者として登録する（登録料 5ドル、1回だけ）。アカウントの設定で、公開する名前（例：swwwitch）と連絡先のメールアドレスを入れ、メールアドレスを確認する。
2. ［新しいアイテム］で zip を読み込む。
3. 下の「ストアの掲載情報」「プライバシーへの取り組み」「配布」を入れる。
4. ［審査のために送信］。審査は数日〜数週間（すべてのサイトで動くため、長めにかかることがある）。

---

## ストアの掲載情報

**名前**：Page Navigator（manifest の name）

**概要**（132文字まで。manifest の description がそのまま使われる）：
どのページでも、エレベーター（左端の見出しの目盛り）・ミニマップ（右端）・上下の帯・見出しのジャンプで移動できます。

**カテゴリ**：仕事効率化（Productivity）

**言語**：日本語

**説明**（日本語）：

```
長いページを、見出しを手がかりにすばやく移動するための拡張機能です。記事・ドキュメント・ブログなど、どのページでも使えます。

■ エレベーター
ページの左端に、見出しの位置を短い線で並べます。線にマウスを載せると見出しの名前が出て、押すとその見出しへ移ります。読んでいる見出しの線は濃くなるので、ページの中の今の位置がひと目で分かります。

■ ミニマップ
画面の右端にマウスを寄せると、ページ全体の縮図が出ます。いま見えている範囲の枠をドラッグするか、縮図を押して移動します。

■ 見出しのジャンプ
Mac は ⌘⌥↓ / ⌘⌥↑、Windows は Alt+Shift+↓ / ↑ で、次・前の見出しへ移ります。移った見出しの名前を画面の上に短く出します。設定で J / K キーも使えます。

■ 上下の帯
スクロールしているときに画面の上端・下端へマウスを寄せると、「ページの先頭へ」「ページの末尾へ」の帯が出ます。

■ 設定
ツールバーのアイコンから、機能ごとのオン／オフと「このサイトでは使わない」を選べます。

・上部に固定されたヘッダーがあるページでも、見出しが隠れない位置で止めます。
・文字の入力中は、キーで移動しません。
・ページの見た目に影響しないよう、表示する部品はページから切り離して作っています。
・情報を集めたり、外部へ送ったりすることはありません。
```

**説明**（英語。「別の言語」で英語を足すとき）：

```
Navigate long pages by their headings — on any website.

• Elevator: short ticks on the left edge mark each heading. Hover to see its title, click to jump there. The tick for the section you're reading is highlighted.
• Minimap: move the mouse to the right edge to reveal a miniature of the whole page. Drag the viewport frame or click to move.
• Heading jump: ⌘⌥↓ / ⌘⌥↑ on Mac, Alt+Shift+↓ / ↑ on Windows. Optionally J / K.
• Top / bottom bars: move the mouse to the top or bottom edge to jump to the start or end of the page.
• Settings: turn each feature on or off, or disable it on specific sites.

Stops below sticky headers, ignores keys while you type, and keeps its UI isolated from the page's styles. No data is collected or sent.
```

**画像**

| 種類 | ファイル |
|---|---|
| アイコン（128×128） | `icons/icon128.png`（zip の中のものが使われる） |
| スクリーンショット（1280×800） | `store/screenshots/rail.png`・`minimap.png`・`jump.png`・`edge.png`（この順） |
| 小さいプロモーション タイル（440×280） | `store/promo-440x280.png` |

**ウェブサイト**：https://github.com/swwwitch/chrome-extensions
**サポート**：https://github.com/swwwitch/chrome-extensions/issues

---

## プライバシーへの取り組み

**単一用途の説明**：
閲覧しているページの中で、見出しを手がかりに移動できるようにします（左端の見出しの目盛り、右端のミニマップ、上下の帯、キーボードでの見出しへのジャンプ）。

**権限が必要な理由**

| 権限 | 理由（入力欄にそのまま貼る） |
|---|---|
| storage | 機能ごとのオン／オフと、「このサイトでは使わない」に選んだサイトの名前を保存するため。 |
| activeTab | ツールバーのアイコンを押したときに、開いているタブのサイト名を設定の画面に表示し、そのサイトだけ止められるようにするため。 |
| ホストの権限（content_scripts の http・https・file） | どのページでも見出しの目盛り・ミニマップ・ジャンプを使えるように、ページの中で見出しの位置を読み取るため。ページの内容は保存も送信もしません。 |

**リモートコードの使用**：いいえ（すべてのコードは拡張機能の中にあります）

**データの使用**：収集するデータはなし（どの項目にもチェックを入れない）。次の3つの宣言にチェックを入れる。
- 承認されている用途以外で、ユーザーデータを第三者に販売、転送しない
- アイテムの単一用途と関係のない目的で、ユーザーデータを使用または転送しない
- 信用度の判断や融資の目的で、ユーザーデータを使用または転送しない

**プライバシー ポリシーの URL**：https://github.com/swwwitch/chrome-extensions/blob/main/PageNavigator/PRIVACY.md

---

## 配布

- 公開設定：公開
- 地域：すべての地域
- 価格：無料
