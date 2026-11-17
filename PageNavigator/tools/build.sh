#!/bin/zsh
# Page Navigator を Chrome・Firefox・Safari 用に書き出す（2026-11-18）
#   tools/build.sh            … 3つとも
#   tools/build.sh chrome     … Chrome（Chrome ウェブストアに出す zip）
#   tools/build.sh firefox    … Firefox（addons.mozilla.org に出す zip。manifest に gecko の ID を足す）
#   tools/build.sh safari     … Safari（Xcode のプロジェクトの Resources を同期して、アプリをビルド・署名。手元で使う版）
#   tools/build.sh appstore   … Mac App Store に出す .pkg（ビルド番号を1つ上げて、アーカイブ→書き出し。store/APPSTORE.md）
#   tools/build.sh appstore upload … 書き出さずに App Store Connect へ送る
# ソースは PageNavigator の直下（manifest.json は Chrome 用。Chrome はこのフォルダーをそのまま読み込める）
set -e
cd "${0:A:h}/.."
ROOT=$PWD
VERSION=$(python3 -c 'import json;print(json.load(open("manifest.json"))["version"])')
FILES=(content.js popup.html popup.js icons)
OUT=$ROOT/build
UPLOAD=0; [[ $1 == appstore && $2 == upload ]] && { UPLOAD=1; set -- appstore; }
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
</dict></plist>
EOF
    codesign --force --sign "$IDENTITY" --timestamp=none --entitlements "$ENT" "$APP/Contents/PlugIns/Page Navigator Extension.appex"
    codesign --force --sign "$IDENTITY" --timestamp=none --entitlements "$ENT" "$APP"
    codesign --verify --deep --strict "$APP"
    rm -f "$OUT/PageNavigator-safari-$VERSION.zip"
    (cd $OUT && ditto -c -k --keepParent "Page Navigator.app" "PageNavigator-safari-$VERSION.zip")
    echo "safari:  build/Page Navigator.app（build/PageNavigator-safari-$VERSION.zip）"
    ;;
  appstore)
    PROJ="$ROOT/safari/Page Navigator"
    XCPROJ="$PROJ/Page Navigator.xcodeproj/project.xcproj"
    RES="$PROJ/Page Navigator Extension/Resources"
    rm -rf "$RES"; mkdir -p "$RES"
    cp -R manifest.json $FILES "$RES/"
    sed -i '' -E "s/\"MARKETING_VERSION\": \"[^\"]*\"/\"MARKETING_VERSION\": \"$VERSION\"/g" "$XCPROJ"
    # ビルド番号を1つ上げる（App Store Connect には同じ番号を2回送れない）
    BUILD=$(( $(grep -m1 -oE '"CURRENT_PROJECT_VERSION": "[0-9]+"' "$XCPROJ" | grep -oE '[0-9]+') + 1 ))
    sed -i '' -E "s/\"CURRENT_PROJECT_VERSION\": \"[0-9]+\"/\"CURRENT_PROJECT_VERSION\": \"$BUILD\"/g" "$XCPROJ"
    ARCHIVE="$OUT/PageNavigator-$VERSION-$BUILD.xcarchive"; rm -rf "$ARCHIVE"
    # 自動署名（Xcode にサインインしているアカウントで、App ID・プロファイルを作る・更新する）
    xcodebuild -project "$PROJ/Page Navigator.xcodeproj" -scheme "Page Navigator" -configuration Release \
      -destination 'generic/platform=macOS' -archivePath "$ARCHIVE" -allowProvisioningUpdates archive >"$OUT/appstore-archive.log" 2>&1 || { tail -30 "$OUT/appstore-archive.log"; exit 1; }
    DEST=export; (( UPLOAD )) && DEST=upload
    cat >"$OUT/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>method</key><string>app-store-connect</string>
<key>destination</key><string>$DEST</string>
<key>teamID</key><string>PL9S9PXX96</string>
<key>signingStyle</key><string>automatic</string>
<key>manageAppVersionAndBuildNumber</key><false/>
</dict></plist>
PLIST
    rm -rf "$OUT/appstore"
    xcodebuild -exportArchive -archivePath "$ARCHIVE" -exportPath "$OUT/appstore" -exportOptionsPlist "$OUT/ExportOptions.plist" -allowProvisioningUpdates >"$OUT/appstore-export.log" 2>&1 || { tail -30 "$OUT/appstore-export.log"; exit 1; }
    if (( UPLOAD )); then echo "appstore: $VERSION ($BUILD) を App Store Connect へ送りました"
    else echo "appstore: build/appstore/Page Navigator.pkg（$VERSION ($BUILD)）"; fi
    ;;
  *) echo "不明な対象：$t（chrome・firefox・safari・appstore）"; exit 1;;
  esac
done
