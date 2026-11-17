#!/bin/zsh
# Page Navigator を Chrome・Firefox・Safari 用に書き出す（2026-11-18）
#   tools/build.sh            … 3つとも
#   tools/build.sh chrome     … Chrome（Chrome ウェブストアに出す zip）
#   tools/build.sh firefox    … Firefox（addons.mozilla.org に出す zip。manifest に gecko の ID を足す）
#   tools/build.sh safari     … Safari（Xcode のプロジェクトの Resources を同期して、アプリをビルド・署名）
# ソースは PageNavigator の直下（manifest.json は Chrome 用。Chrome はこのフォルダーをそのまま読み込める）
set -e
cd "${0:A:h}/.."
ROOT=$PWD
VERSION=$(python3 -c 'import json;print(json.load(open("manifest.json"))["version"])')
FILES=(content.js popup.html popup.js icons)
OUT=$ROOT/build
if (( $# )); then TARGETS=($@); else TARGETS=(chrome firefox safari); fi
mkdir -p $OUT

for t in $TARGETS; do
  case $t in
  chrome)
    rm -rf $OUT/chrome $OUT/PageNavigator-chrome-$VERSION.zip; mkdir -p $OUT/chrome
    cp -R manifest.json $FILES $OUT/chrome/
    (cd $OUT/chrome && zip -qrX ../PageNavigator-chrome-$VERSION.zip . -x '.DS_Store')
    echo "chrome:  build/PageNavigator-chrome-$VERSION.zip"
    ;;
  firefox)
    rm -rf $OUT/firefox $OUT/PageNavigator-firefox-$VERSION.zip; mkdir -p $OUT/firefox
    cp -R $FILES $OUT/firefox/
    python3 - "$OUT/firefox/manifest.json" <<'EOF'
import json,sys
m=json.load(open('manifest.json'))
# Firefox：アドオンの ID（署名・同期に必要）と、全サイトへのアクセス（MV3 では host_permissions に書く）
m['browser_specific_settings']={'gecko':{'id':'page-navigator@swwwitch','strict_min_version':'140.0','data_collection_permissions':{'required':['none']}}}
m['host_permissions']=['http://*/*','https://*/*','file:///*']
open(sys.argv[1],'w').write(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
EOF
    (cd $OUT/firefox && zip -qrX ../PageNavigator-firefox-$VERSION.zip . -x '.DS_Store')
    echo "firefox: build/PageNavigator-firefox-$VERSION.zip"
    ;;
  safari)
    PROJ="$ROOT/safari/Page Navigator"
    RES="$PROJ/Page Navigator Extension/Resources"
    rm -rf "$RES"; mkdir -p "$RES"
    cp -R manifest.json $FILES "$RES/"
    # アプリの版を manifest にそろえる
    sed -i '' -E "s/\"MARKETING_VERSION\": \"[^\"]*\"/\"MARKETING_VERSION\": \"$VERSION\"/g" "$PROJ/Page Navigator.xcodeproj/project.xcproj"
    xcodebuild -project "$PROJ/Page Navigator.xcodeproj" -scheme "Page Navigator" -configuration Release -derivedDataPath "$OUT/safari-dd" CODE_SIGNING_ALLOWED=NO build >"$OUT/safari-build.log" 2>&1 || { tail -20 "$OUT/safari-build.log"; exit 1; }
    APP="$OUT/Page Navigator.app"; rm -rf "$APP"
    cp -R "$OUT/safari-dd/Build/Products/Release/Page Navigator.app" "$APP"
    # 署名（macos-apps と同じ証明書。拡張機能はサンドボックスが必要）
    IDENTITY="${PAGENAV_SIGNING_IDENTITY:-301A41C0A37B6B578B7477229015992E8AA34E44}"
    ENT="$OUT/sandbox.entitlements"
    cat >"$ENT" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>com.apple.security.app-sandbox</key><true/>
<key>com.apple.security.files.user-selected.read-only</key><true/>
</dict></plist>
EOF
    codesign --force --sign "$IDENTITY" --timestamp=none --entitlements "$ENT" "$APP/Contents/PlugIns/Page Navigator Extension.appex"
    codesign --force --sign "$IDENTITY" --timestamp=none --entitlements "$ENT" "$APP"
    codesign --verify --deep --strict "$APP"
    rm -f "$OUT/PageNavigator-safari-$VERSION.zip"
    (cd $OUT && ditto -c -k --keepParent "Page Navigator.app" "PageNavigator-safari-$VERSION.zip")
    echo "safari:  build/Page Navigator.app（build/PageNavigator-safari-$VERSION.zip）"
    ;;
  *) echo "不明な対象：$t（chrome・firefox・safari）"; exit 1;;
  esac
done
