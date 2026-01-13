// ===== БЕЛЫЙ СПИСОК УСТРОЙСТВ =====
// Добавляй сюда Device ID разрешенных устройств
const DEVICE_WHITELIST = [
    "BROWN-A1B2-C3D4",  // Пример устройства 1
    "BROWN-E5F6-G7H8",  // Пример устройства 2
    "BROWN-I9J0-K1L2"   // Пример устройства 3
];

// ===== ПЕРЕМЕННЫЕ =====
let isAuthenticated = false;
let history = JSON.parse(localStorage.getItem('multitool_history') || '[]');
let deviceId = '';

// ===== ГЕНЕРАЦИЯ ID УСТРОЙСТВА =====
function generateDeviceId() {
    // Создаем уникальный ID на основе характеристик устройства
    const components = [
        navigator.userAgent,
        navigator.platform,
        navigator.language,
        screen.width + 'x' + screen.height,
        navigator.hardwareConcurrency || 'unknown',
        new Date().getTimezoneOffset()
    ];
    
    // Хэш функция
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    // Формат: BROWN-XXXX-XXXX
    const base36 = Math.abs(hash).toString(36).toUpperCase();
    const part1 = base36.substring(0, 4).padStart(4, '0');
    const part2 = base36.substring(4, 8).padStart(4, '0');
    
    return `BROWN-${part1}-${part2}`;
}

// ===== ПОЛУЧЕНИЕ ИЛИ СОЗДАНИЕ DEVICE ID =====
function getOrCreateDeviceId() {
    let id = localStorage.getItem('device_id');
    if (!id) {
        id = generateDeviceId();
        localStorage.setItem('device_id', id);
    }
    return id;
}

// ===== ПРОВЕРКА В БЕЛОМ СПИСКЕ =====
function checkWhitelist() {
    deviceId = getOrCreateDeviceId();
    
    // Проверяем, есть ли устройство в белом списке
    const isWhitelisted = DEVICE_WHITELIST.includes(deviceId);
    
    // Обновляем UI
    updateActivationUI(isWhitelisted);
    
    return isWhitelisted;
}

// ===== ОБНОВЛЕНИЕ UI АКТИВАЦИИ =====
function updateActivationUI(isWhitelisted) {
    const deviceIdDisplay = document.getElementById('device-id-display');
    const licenseStatus = document.getElementById('license-status');
    const expireDateElement = document.getElementById('expire-date');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const activationResult = document.getElementById('activation-result');
    
    if (deviceIdDisplay) {
        deviceIdDisplay.textContent = deviceId;
    }
    
    if (licenseStatus) {
        if (isWhitelisted) {
            licenseStatus.textContent = 'В белом списке ✓';
            licenseStatus.className = 'license-value active';
            licenseStatus.style.color = '#10b981';
        } else {
            licenseStatus.textContent = 'Не в списке ✗';
            licenseStatus.className = 'license-value';
            licenseStatus.style.color = '#ef4444';
        }
    }
    
    if (expireDateElement) {
        expireDateElement.textContent = isWhitelisted ? 'Бессрочно' : '-';
    }
    
    if (activationResult) {
        activationResult.style.display = 'block';
    }
    
    if (successMessage) {
        successMessage.style.display = isWhitelisted ? 'flex' : 'none';
    }
    
    if (errorMessage) {
        errorMessage.style.display = isWhitelisted ? 'none' : 'flex';
    }
    
    // Показываем/скрываем кнопки в зависимости от статуса
    const copyBtn = document.getElementById('copy-device-id-btn');
    const telegramBtn = document.getElementById('telegram-contact-btn');
    const retryBtn = document.getElementById('retry-check-btn');
    
    if (copyBtn) copyBtn.style.display = isWhitelisted ? 'none' : 'block';
    if (telegramBtn) telegramBtn.style.display = isWhitelisted ? 'none' : 'block';
    if (retryBtn) retryBtn.style.display = isWhitelisted ? 'block' : 'none';
}

// ===== ОБНОВЛЕНИЕ ИНФОРМАЦИИ В ОСНОВНОМ ИНТЕРФЕЙСЕ =====
function updateLicenseInfo() {
    if (deviceId) {
        const isWhitelisted = DEVICE_WHITELIST.includes(deviceId);
        
        // Обновляем элементы
        const elements = {
            'user-device-id': deviceId,
            'user-license-status': isWhitelisted ? 'В белом списке ✓' : 'Не в списке ✗',
            'user-expire-date': 'Бессрочно',
            'user-added-date': new Date().toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                
                // Подсветка статуса
                if (id === 'user-license-status') {
                    if (isWhitelisted) {
                        element.className = 'license-value active';
                        element.style.color = '#10b981';
                    } else {
                        element.className = 'license-value';
                        element.style.color = '#ef4444';
                    }
                }
            }
        }
    }
}

// ===== СОЗДАНИЕ ЗВЕЗДНОГО ПОЛЯ =====
function createStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;
    
    const starCount = 80;
    starfield.innerHTML = '';
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        const size = Math.random();
        let starSize, starWidth;
        
        if (size < 0.7) {
            starSize = 'small';
            starWidth = 1;
        } else if (size < 0.9) {
            starSize = 'medium';
            starWidth = 1.5;
        } else {
            starSize = 'large';
            starWidth = 2;
        }
        
        const left = Math.random() * 100;
        const startTop = Math.random() * 100;
        const duration = Math.random() * 20 + 40;
        const delay = Math.random() * 15;
        const twinkleDuration = Math.random() * 4 + 3;
        const direction = Math.random() * 8 - 4;
        
        star.className = `star ${starSize}`;
        star.style.left = `${left}%`;
        star.style.top = `${startTop}%`;
        star.style.width = `${starWidth}px`;
        star.style.height = `${starWidth}px`;
        star.style.setProperty('--direction', `${direction}px`);
        star.style.animation = `starFall ${duration}s linear ${delay}s infinite, starTwinkle ${twinkleDuration}s ease-in-out ${delay}s infinite`;
        
        starfield.appendChild(star);
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function init() {
    createStarfield();
    
    // Обновляем звезды каждую минуту
    setInterval(() => {
        createStarfield();
    }, 60000);
    
    // Проверяем белый список
    const isWhitelisted = checkWhitelist();
    
    // Если устройство в белом списке, сразу показываем загрузку
    if (isWhitelisted) {
        isAuthenticated = true;
        
        // Задержка для показа статуса
        setTimeout(() => {
            startSiteLoader();
        }, 1500);
    }
    
    // Назначаем обработчики кнопок
    document.getElementById('copy-device-id-btn').addEventListener('click', copyDeviceId);
    document.getElementById('telegram-contact-btn').addEventListener('click', openTelegram);
    document.getElementById('retry-check-btn').addEventListener('click', retryCheck);
}

// ===== КОПИРОВАНИЕ DEVICE ID =====
function copyDeviceId() {
    navigator.clipboard.writeText(deviceId).then(() => {
        showToast('Device ID скопирован! Отправьте его администратору.');
    }).catch(err => {
        const textarea = document.createElement('textarea');
        textarea.value = deviceId;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Device ID скопирован! Отправьте его администратору.');
    });
}

// ===== ОТКРЫТИЕ TELEGRAM =====
function openTelegram() {
    const message = `Здравствуйте! Хочу добавить свое устройство в белый список BROWN-LINK.\nМой Device ID: ${deviceId}\nПрошу добавить мое устройство в список разрешенных.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://t.me/brown_tme?text=${encodedMessage}`, '_blank');
    showToast('Telegram открыт. Отправьте сообщение администратору.');
}

// ===== ПОВТОРНАЯ ПРОВЕРКА =====
function retryCheck() {
    const isWhitelisted = checkWhitelist();
    
    if (isWhitelisted) {
        showToast('Устройство найдено в белом списке! Загрузка...');
        isAuthenticated = true;
        
        setTimeout(() => {
            startSiteLoader();
        }, 1500);
    } else {
        showToast('Устройство еще не добавлено в белый список.');
    }
}

// ===== ПРЕЛОАДЕР САЙТА =====
function startSiteLoader() {
    const loader = document.getElementById('site-loader');
    const activationSystem = document.getElementById('activation-system');
    const progressBar = document.getElementById('site-progress');
    const timer = document.getElementById('site-loader-timer');
    const mainContent = document.getElementById('main-content');
    
    if (activationSystem) {
        activationSystem.style.display = 'none';
    }
    
    if (loader) {
        loader.classList.remove('hidden');
    }
    
    let progress = 0;
    const steps = 4;
    const totalTime = 2000;
    
    function updateSteps(currentStep) {
        const stepElements = document.querySelectorAll('.step');
        stepElements.forEach((step, index) => {
            const icon = step.querySelector('i');
            if (index < currentStep) {
                step.classList.add('active');
                icon.className = 'fas fa-check';
            } else if (index === currentStep) {
                step.classList.add('active');
                icon.className = 'fas fa-spinner fa-spin';
            } else {
                step.classList.remove('active');
                icon.className = 'fas fa-spinner';
            }
        });
    }
    
    if (document.querySelector('.step')) {
        updateSteps(0);
    }
    
    const interval = setInterval(() => {
        progress += 100 / (totalTime / 100);
        if (progressBar) {
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
        if (timer) {
            timer.textContent = `${Math.min(Math.round(progress), 100)}%`;
        }
        
        const currentStep = Math.floor(progress / (100 / steps));
        if (document.querySelector('.step')) {
            updateSteps(currentStep);
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            
            setTimeout(() => {
                if (loader) {
                    loader.style.opacity = '0';
                    loader.style.transition = 'opacity 0.5s ease';
                }
                
                setTimeout(() => {
                    if (loader) {
                        loader.style.display = 'none';
                    }
                    if (mainContent) {
                        mainContent.style.display = 'block';
                    }
                    
                    initMainApp();
                }, 500);
            }, 300);
        }
    }, 100);
}

// ===== ИНИЦИАЛИЗАЦИЯ ОСНОВНОГО ПРИЛОЖЕНИЯ =====
function initMainApp() {
    updateLicenseInfo();
    
    // Навигация
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
            
            if (pageId === 'history-page') {
                loadHistory();
            }
        });
    });
    
    // Загружаем историю
    loadHistory();
    
    // Назначаем обработчики
    document.getElementById('standoff-btn').addEventListener('click', handleStandoff);
    document.getElementById('generate-link-btn').addEventListener('click', generateLink);
    document.getElementById('copy-link-btn').addEventListener('click', copyLink);
    document.getElementById('generate-md5-btn').addEventListener('click', generateMD5);
    document.getElementById('copy-md5-btn').addEventListener('click', copyMD5);
    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
    document.getElementById('refresh-history-btn').addEventListener('click', loadHistory);
    document.getElementById('close-alert-btn').addEventListener('click', closeAlert);
    document.getElementById('manage-device-btn').addEventListener('click', openTelegram);
    
    // Обработчик выхода
    if (document.getElementById('logout-btn')) {
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
    
    // Показываем приветственное уведомление
    setTimeout(() => {
        showToast('Добро пожаловать! Устройство в белом списке.');
    }, 500);
}

// ===== ВЫХОД ИЗ СИСТЕМЫ =====
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        isAuthenticated = false;
        
        document.getElementById('activation-system').style.display = 'flex';
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('site-loader').style.display = 'none';
        
        // Обновляем проверку
        checkWhitelist();
        showToast('Вы вышли из системы');
    }
}

// ===== STANDOFF =====
function handleStandoff() {
    const text = document.getElementById('standoff-text').value.trim();
    const displayText = text || 'Запуск Standoff 2 с инжектом';
    
    addToHistory(displayText, 'standoff');
    showInjectAlert();
    document.getElementById('standoff-text').value = '';
}

function showInjectAlert() {
    const alert = document.getElementById('inject-alert');
    const timeElement = document.getElementById('inject-time');
    
    const now = new Date();
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    if (alert) {
        alert.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeAlert() {
    const alert = document.getElementById('inject-alert');
    if (alert) {
        alert.classList.add('hidden');
        document.body.style.overflow = 'auto';
        showToast('Инжект завершен');
    }
}

// ===== ССЫЛКИ =====
function generateLink() {
    const platform = document.getElementById('platform-select').value;
    let link = '';
    
    function randomString(length, chars) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    switch(platform) {
        case 'youtube':
            link = `https://youtube.com/watch?v=${randomString(11, chars + '-_')}`;
            break;
        case 'telegram':
            link = `https://t.me/${randomString(8, 'abcdefghijklmnopqrstuvwxyz0123456789_')}`;
            break;
        case 'instagram':
            link = `https://instagram.com/p/${randomString(11, chars + '-_')}/`;
            break;
        case 'tiktok':
            link = `https://tiktok.com/@user/video/${Math.floor(Math.random() * 10000000000000000000)}`;
            break;
    }
    
    document.getElementById('generated-link').textContent = link;
    document.getElementById('link-result').classList.remove('hidden');
    addToHistory(link, 'link', platform);
}

function copyLink() {
    const link = document.getElementById('generated-link').textContent;
    copyToClipboard(link);
    showToast('Ссылка скопирована!');
}

// ===== MD5 =====
function generateMD5() {
    const text = document.getElementById('md5-text').value;
    let hash = '';
    
    if (!text.trim()) {
        const chars = '123456789abcdef';
        hash += 'abcd'[Math.floor(Math.random() * 4)];
        hash += 'ef'[Math.floor(Math.random() * 2)];
        
        for (let i = 0; i < 26; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
    } else {
        function simpleHash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash);
        }
        
        let hash1 = simpleHash(text + Date.now());
        let hash2 = simpleHash(text + 'salt');
        
        let combined = (hash1 * hash2).toString(16);
        combined = combined.replace(/0/g, '');
        
        while (combined.length < 32) {
            combined = 'abcdef'[Math.floor(Math.random() * 6)] + combined;
        }
        
        hash = combined.substring(0, 32);
    }
    
    document.getElementById('generated-md5').textContent = hash;
    document.getElementById('md5-result').classList.remove('hidden');
    
    const displayText = text ? `${text.substring(0, 15)}${text.length > 15 ? '...' : ''}` : 'случайный хэш';
    addToHistory(hash, 'md5', displayText);
    document.getElementById('md5-text').value = '';
}

function copyMD5() {
    const hash = document.getElementById('generated-md5').textContent;
    copyToClipboard(hash);
    showToast('MD5 хэш скопирован!');
}

// ===== ИСТОРИЯ =====
function addToHistory(text, type, extra = '') {
    const item = {
        id: Date.now(),
        text: text,
        type: type,
        extra: extra,
        timestamp: new Date().toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    history.unshift(item);
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem('multitool_history', JSON.stringify(history));
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    history = JSON.parse(localStorage.getItem('multitool_history') || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">История пуста</p>';
        return;
    }
    
    let html = '';
    history.forEach(item => {
        let icon = '📝';
        let color = '#8b5cf6';
        
        switch(item.type) {
            case 'standoff': 
                icon = '🎮'; 
                color = '#f97316'; 
                break;
            case 'link': 
                icon = '🔗'; 
                color = '#8b5cf6'; 
                break;
            case 'md5': 
                icon = '🔐'; 
                color = '#10b981'; 
                break;
        }
        
        html += `
            <div class="history-item">
                <div style="flex:1">
                    <div class="history-text">${icon} ${item.text}</div>
                    <div class="history-meta">${item.timestamp} ${item.extra ? '• ' + item.extra : ''}</div>
                </div>
                <div class="history-actions">
                    <button class="history-btn copy-btn" data-text="${item.text}">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="history-btn delete-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
    
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.getAttribute('data-text');
            copyToClipboard(text);
            showToast('Скопировано!');
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            history = history.filter(item => item.id !== id);
            localStorage.setItem('multitool_history', JSON.stringify(history));
            loadHistory();
            showToast('Запись удалена');
        });
    });
}

function clearHistory() {
    if (confirm('Очистить всю историю?')) {
        history = [];
        localStorage.setItem('multitool_history', '[]');
        loadHistory();
        showToast('История очищена');
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Текст скопирован');
    }).catch(err => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

// ===== ЗАПУСК ПРИ ЗАГРУЗКЕ =====
document.addEventListener('DOMContentLoaded', init);

// ===== ФУНКЦИИ ДЛЯ АДМИНИСТРАТОРА =====
// Чтобы добавить устройство в белый список, администратор должен:
// 1. Получить Device ID от пользователя
// 2. Добавить его в массив DEVICE_WHITELIST в начале файла
// 3. Обновить сайт

// Пример как администратор может быстро добавить устройство (в консоли браузера):
// DEVICE_WHITELIST.push("BROWN-NEW-DEVICE-ID");
// checkWhitelist(); // Перепроверить
