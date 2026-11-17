function show(enabled, useSettingsInsteadOfPreferences) {
    if (useSettingsInsteadOfPreferences) {
        document.getElementsByClassName('state-on')[0].innerText = "Page Navigator はオンです。Safariの設定の「機能拡張」でオフにできます。";
        document.getElementsByClassName('state-off')[0].innerText = "Page Navigator はオフです。Safariの設定の「機能拡張」でオンにしてください。";
        document.getElementsByClassName('state-unknown')[0].innerText = "Safariの設定の「機能拡張」で、Page Navigator をオンにしてください。";
        document.getElementsByClassName('open-preferences')[0].innerText = "終了して、Safariの設定を開く";
    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

function openPreferences() {
    webkit.messageHandlers.controller.postMessage("open-preferences");
}

document.querySelector("button.open-preferences").addEventListener("click", openPreferences);
