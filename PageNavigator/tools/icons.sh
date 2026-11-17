#!/bin/zsh
# アイコンを icon-src の SVG から書き出す（ヘッドレスの Chrome で描く）
#   icons/icon16〜128.png             … 拡張機能（icon.svg。四隅まで塗る）
#   safari/…/AppIcon.appiconset        … macOS のアプリ（mac.svg。余白と影つき。1024 は App Store にも使われる）
#   safari/…/Resources/Icon.png        … アプリの画面に出すアイコン（mac.svg を 256 で。画面では 128 で表示）
set -e
cd "${0:A:h}/.."
ROOT=$PWD
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP=$(mktemp -d)
render() { # svg 大きさ 書き出し先
  print -r -- "<!doctype html><style>html,body{margin:0;background:transparent}img{display:block;width:$2px;height:$2px}</style><img src=\"file://$ROOT/$1\">" >"$TMP/p.html"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --default-background-color=00000000 \
    --window-size=$2,$2 --screenshot="$3" "file://$TMP/p.html" >/dev/null 2>&1
}
for s in 16 32 48 128; do render icon-src/icon.svg $s icons/icon$s.png; done
SET="safari/Page Navigator/Page Navigator/Assets.xcassets/AppIcon.appiconset"
for s in 16 32 128 256 512; do
  render icon-src/mac.svg $s "$SET/mac-icon-$s@1x.png"
  render icon-src/mac.svg $((s*2)) "$SET/mac-icon-$s@2x.png"
done
render icon-src/mac.svg 256 "safari/Page Navigator/Page Navigator/Resources/Icon.png"
rm -rf "$TMP"
echo "icons: 書き出しました"
