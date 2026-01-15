// script.js

let attempts = 3;
const VALID_KEYS = ["BRAIN-N7P9R1T3V5X7Z9B1D3F5H7"];

document.getElementById("submit-key-btn").onclick = () => {
    const key = document.getElementById("key-input").value.trim();
    if (VALID_KEYS.includes(key)) {
        document.getElementById("key-system").style.display = "none";
        startLoader();
    } else {
        attempts--;
        document.getElementById("attempts-counter").textContent = attempts;
        document.getElementById("attempts-progress").style.width = (attempts/3*100)+"%";
    }
};

function startLoader(){
    const loader=document.getElementById("site-loader");
    const bar=document.getElementById("site-progress");
    const timer=document.getElementById("site-loader-timer");
    loader.classList.remove("hidden");
    let p=0;
    const i=setInterval(()=>{
        p+=5;
        bar.style.width=p+"%";
        timer.textContent=p+"%";
        if(p>=100){
            clearInterval(i);
            loader.style.display="none";
            document.getElementById("main-content").style.display="block";
        }
    },80);
}

// НАВИГАЦИЯ
document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.onclick=()=>{
        document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
        document.getElementById(btn.dataset.page).classList.add("active");
    };
});

// ПОДКЛЮЧЕНИЕ УСТРОЙСТВА
document.getElementById("connect-btn").onclick=()=>{
    const log=document.getElementById("connect-log");
    const bar=document.getElementById("connect-bar");
    document.getElementById("connect-progress").classList.remove("hidden");
    document.getElementById("connect-btn").style.display="none";
    let p=0;
    const texts=[
        "Инициализация...",
        "Поиск серверов...",
        "Установка канала...",
        "Синхронизация...",
        "Проверка статуса..."
    ];
    const i=setInterval(()=>{
        p+=10;
        bar.style.width=p+"%";
        log.textContent=texts[Math.floor(Math.random()*texts.length)];
        if(p>=100){
            clearInterval(i);
            document.getElementById("connect-progress").classList.add("hidden");
            document.getElementById("device-info").classList.remove("hidden");
        }
    },400);
};

// TOGGLES
document.querySelectorAll(".toggle-input").forEach(t=>{
    t.onchange=()=>{
        const bar=document.getElementById("toggle-bar");
        const box=document.getElementById("toggle-progress");
        box.classList.remove("hidden");
        let p=0;
        const i=setInterval(()=>{
            p+=20;
            bar.style.width=p+"%";
            if(p>=100){
                clearInterval(i);
                box.classList.add("hidden");
                bar.style.width="0%";
            }
        },200);
    };
});
