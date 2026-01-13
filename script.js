// script.js

// ====== РАЗРЕШЁННЫЕ ID УСТРОЙСТВ ======
const ALLOWED_DEVICE_IDS = [
    "8d57b3c9c817b569",
    "exampledeviceid123456"
];

// ====== TELEGRAM ======
document.getElementById("tg-btn").onclick = () => {
    window.open("https://t.me/brown_link", "_blank");
};

// ====== DEVICE ID ======
function getDeviceId() {
    let id = localStorage.getItem("device_id");
    if (!id) {
        const raw =
            navigator.userAgent +
            screen.width +
            screen.height +
            navigator.language +
            navigator.platform;
        id = hashString(raw);
        localStorage.setItem("device_id", id);
    }
    return id;
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16);
}

// ====== ПРОВЕРКА ДОСТУПА ======
const deviceId = getDeviceId();
document.getElementById("device-id-text").textContent =
    "ID устройства: " + deviceId;

if (ALLOWED_DEVICE_IDS.includes(deviceId)) {
    startSiteLoader();
}

// ====== ЗАПУСК ПРИЛОЖЕНИЯ ======
function startSiteLoader() {
    document.getElementById("access-screen").style.display = "none";
    const loader = document.getElementById("site-loader");
    const progress = document.getElementById("site-progress");
    const timer = document.getElementById("site-loader-timer");

    loader.classList.remove("hidden");
    let p = 0;

    const i = setInterval(() => {
        p += 5;
        progress.style.width = p + "%";
        timer.textContent = p + "%";
        if (p >= 100) {
            clearInterval(i);
            loader.style.display = "none";
            document.getElementById("main-content").style.display = "block";
            initMainApp();
        }
    }, 100);
}
