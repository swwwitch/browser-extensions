# Firefox のアドオン（addons.mozilla.org）への提出（Page Navigator）

提出する zip は `tools/build.sh firefox` で作る `build/PageNavigator-firefox-版.zip`。manifest には Firefox 用の ID（`page-navigator@swwwitch`）、対応する版（Firefox 140 以降）、データを集めないことの宣言（`data_collection_permissions: none`）が入る。

### 手順

1. Firefox アカウントで https://addons.mozilla.org/developers/ にログインする（無料）。初めてのときは開発者契約に同意する。
2. ［新しいアドオンを提出］→ 配布方法は［このサイトで公開する（On this site）］。
3. zip を読み込む。対応するプラットフォームは［Firefox（デスクトップ）］だけにする（マウスで操作する機能なので Android は外す）。
4. 「ソースコードを提出しますか」は［いいえ］（圧縮・変換していないコードをそのまま入れているため）。
5. 下の「掲載情報」を入れて、［バージョンを提出］。自動の検査のあと、人の審査が入ることがある。

---

## 掲載情報

**名前**：Page Navigator

**アドオンの URL**：`page-navigator-headings`（https://addons.mozilla.org/firefox/addon/page-navigator-headings/ 。`page-navigator` は他のアドオンが使用済み）

**概要**（250文字まで）：
どのページでも、エレベーター（左端の見出しの目盛り）・ミニマップ（右端）・上下の帯・見出しのジャンプ（⌘⌥↓↑／Alt+Shift+↓↑）で、長いページを見出しを手がかりに移動できます。

**説明**：Chrome ウェブストアと同じ文（`store/LISTING.md` の「説明（日本語）」）。英語を足すときは、ロケールに English を加えて「説明（英語）」を入れる。

**カテゴリ**：その他（Other）。2つ目を選べるなら「外観（Appearance）」

**タグ**：navigation、headings、minimap、scroll、productivity

**サポート**
- サポートサイト：https://github.com/swwwitch/browser-extensions/issues
- サポート用メールアドレス：空欄でよい（入れると公開される）

**ライセンス**：MIT License（一覧の［MIT License］を選ぶ。リポジトリの `LICENSE` と同じ）

**プライバシー ポリシー**：データを集めないので任意。入れるなら `PRIVACY.md` の内容を貼る。

**画像**
- アイコン：`icons/icon128.png` を［製品ページを編集］→［メディア］で読み込む（zip の中のアイコンは自動では使われず、パズルのピースのままになる）
- スクリーンショット：`store/screenshots/` の rail・minimap・jump・edge（1280×800）

**審査担当者へのメモ**（Notes to Reviewer）：

```
Page Navigator adds in-page navigation aids (heading ticks on the left edge, a minimap on the right edge, top/bottom bars, and keyboard jumps between headings).
- No remote code, no minified or bundled code; all files are the original sources.
- No network requests and no data collection. Settings are stored with storage.sync only.
- The content script runs on all pages because it reads heading positions on the current page; nothing is stored or transmitted.
- UI is rendered inside a Shadow DOM so it does not affect page styles.
Source: https://github.com/swwwitch/browser-extensions/tree/main/PageNavigator
```

