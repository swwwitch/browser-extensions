# Mac App Store への提出（Page Navigator の Safari 版）

Safari の拡張機能は、Mac のアプリ（`safari/Page Navigator`）に入れて、App Store から配る。アプリを開くと「Safari の設定で機能拡張をオンに」という案内と、設定を開くボタンが出る。

- バンドル ID：アプリ `jp.dtp-transit.pagenavigator`、機能拡張 `jp.dtp-transit.pagenavigator.Extension`
- チーム：PL9S9PXX96（自動署名。Xcode にサインインしているアカウントで、App ID とプロファイルを作る）
- 対応：macOS 12 以降（Safari 15.4 以降の Manifest V3）
- 権限：サンドボックスだけ（ネットワーク・ファイルの権限は外した）。暗号化の申告は Info.plist の `ITSAppUsesNonExemptEncryption = NO` で済む

### 手順

1. App Store Connect（https://appstoreconnect.apple.com/ ）の［アプリ］→［＋］→［新規アプリ］
   - プラットフォーム：macOS
   - 名前：Page Navigator（使われていたら「Page Navigator for Safari」）
   - 言語：日本語
   - バンドル ID：`jp.dtp-transit.pagenavigator`（一覧に無いときは、先に `tools/build.sh appstore` を1回実行すると登録される）
   - SKU：`pagenavigator-mac`
   - ユーザーアクセス：フルアクセス
2. ビルドを送る：`tools/build.sh appstore upload`（ビルド番号を1つ上げてアーカイブし、そのまま送る）。`tools/build.sh appstore` だけなら `build/appstore/Page Navigator.pkg` を書き出すので、Transporter で送ってもよい。
3. 送ったビルドの処理が終わるまで数分〜数十分待つ。
4. 下の「掲載情報」「アプリ情報・価格」「App のプライバシー」「審査用の情報」を入れる。
5. ［1.0 提出準備中］のページで：
   - 版の表記（最初は「1.0」）を、ビルドと同じ「1.0.0」に書き換える
   - ［ビルド］の［ビルドを追加］で、送ったビルド（例：1.0.0 (4)）を選ぶ
   - 右上の［保存］
6. ［審査用に追加］→［審査へ提出］。足りない項目があると、ここで赤い枠で知らせてくる。審査は最大48時間で、結果はメールで届く。

2026-11-20 に 1.0.0 (4) を提出。

---

## 掲載情報

**名前**（30文字まで）：Page Navigator

**サブタイトル**（30文字まで）：見出しを手がかりに長いページを移動

**プロモーション用テキスト**（170文字まで。審査なしで変えられる）：
Safari のどのページでも、左端の見出しの目盛り・右端のミニマップ・上下の帯・キーボードで、長いページを見出しを手がかりにすばやく移動できます。

**説明**：Chrome ウェブストアと同じ文（`store/LISTING.md` の「説明（日本語）」）。ただし、次の2か所を Safari 向けに変える。
- 「■ 見出しのジャンプ」の「Mac は ⌘⌥↓ / ⌘⌥↑、Windows は Alt+Shift+↓ / ↑ で」→「⌘⌥↓ / ⌘⌥↑ で」
- 「■ 設定」の「ツールバーのアイコンから」→「Safari のツールバーのアイコンから」
- 最後に1行足す：「インストール後、アプリを開き、Safari の設定の［機能拡張］で Page Navigator をオンにしてください。」

**キーワード**（100文字まで。カンマ区切り）：
見出し,目次,スクロール,ミニマップ,ナビゲーション,ページ内移動,Safari,機能拡張,ジャンプ,長文,読書,heading,minimap,navigation

**サポート URL**：https://github.com/swwwitch/browser-extensions/issues
**マーケティング URL**：https://github.com/swwwitch/browser-extensions
**プライバシーポリシー URL**：https://github.com/swwwitch/browser-extensions/blob/main/PageNavigator/PRIVACY.md

**カテゴリ**：仕事効率化（Productivity）。サブは ユーティリティ（Utilities）
**著作権**：2026 swwwitch

**スクリーンショット**（Mac。1280×800 が使える）：`store/screenshots/` の rail・minimap・jump・edge（この順）

**年齢制限**：質問はすべて「なし」「いいえ」（制限のない Web アクセスも「いいえ」。ページを開く機能は無く、開いているページに表示を足すだけ）→ 4+

---

## アプリ情報・価格

- **コンテンツ配信権**（［アプリ情報］→［コンテンツ配信権］の［編集］）：「いいえ、このアプリには、サードパーティのコンテンツは含まれておらず、表示もアクセスも行いません」→ ダイアログの［完了］のあと、ページ右上の［保存］も押す
- **DSA（EU デジタルサービス法）**：［アプリ情報］ではなく［アプリのコンプライアンス］のページにある。このアカウントはノントレーダーとして申告済みなので、新しいアプリでは何もしなくてよい
- **価格**（［価格および配信状況］→［価格を追加］）：基準の国はアメリカ合衆国のまま、価格 $0.00 →［次へ］→［次へ］→［確認］
- **配信状況**（同じページの［配信状況の設定］）：［すべての国または地域］→［次へ］→［確認］（175 の国と地域）

---

## App のプライバシー

- **プライバシーポリシー URL**：［アプリのプライバシー］のページの［プライバシーポリシー］の［編集］で入れる（掲載情報のページには欄が無い。入れ忘れると［審査用に追加］で止められる）
- データの収集：［いいえ、このAppからデータを収集しません］
- 設定（機能のオン／オフ、止めるサイトの名前）は Safari の拡張機能の保存領域に置くだけで、外部へ送らない

---

## 審査用の情報（App Review に関する情報）

- サインイン：不要（［サインインが必要］のチェックを外す）
- 連絡先：氏名・電話・メールは App Store Connect のアカウントの情報を入れる（公開されない）。電話は国番号から「+」を付けて、市外局番の頭の 0 を取る（例：`+81 80 1234 5678`）。「+」が無いと「このフィールドは無効です」になる
- メモ：

```
Page Navigator is a Safari Web Extension. The app itself only shows how to enable the extension.

How to test:
1. Open the app and click the button to open Safari Settings > Extensions, then turn on "Page Navigator".
2. Allow the extension on a website (for example https://developer.apple.com/documentation/ or any long article).
3. On a long page with headings:
   - Short ticks appear on the left edge. Hover to see a heading title, click to jump to it.
   - Move the mouse to the right edge to show a minimap of the page.
   - Press Command+Option+Down / Up to jump to the next / previous heading.
   - Move the mouse to the top or bottom edge while scrolling to show bars that jump to the top / bottom.
4. Click the toolbar icon to turn each feature on or off, or disable it on the current site.

The extension does not collect or transmit any data and makes no network requests.
```
