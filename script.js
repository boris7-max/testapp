// ===== КЛЮЧЕВАЯ СИСТЕМА =====
const VALID_KEYS = [
    "BRAIN-N7P9R1T3V5X7Z9B1D3F5H7"
];
const VALID_LICENSE_DURATION = 7; // дней

// ===== ПЕРЕМЕННЫЕ =====
let attempts = 3;
let isAuthenticated = false;
let currentUserKey = '';
let history = JSON.parse(localStorage.getItem('multitool_history') || '[]');
let licenseExpireDate = '';

// ===== ГЕНЕРАЦИЯ ID УСТРОЙСТВА =====
function generateDeviceId() {
    const components = [
        navigator.userAgent,
        navigator.platform,
        navigator.language,
        screen.width + 'x' + screen.height,
        navigator.hardwareConcurrency || 'unknown'
    ];
    
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return 'DEV-' + Math.abs(hash).toString(36).toUpperCase().substring(0, 8);
}

// ===== ПРОВЕРКА ЛИЦЕНЗИИ =====
function checkLicense(key, deviceId) {
    if (!VALID_KEYS.includes(key)) {
        return { valid: false, reason: 'invalid_key' };
    }
    
    const savedLicense = localStorage.getItem(`license_${key}`);
    if (!savedLicense) {
        return { valid: true, isNew: true };
    }
    
    try {
        const license = JSON.parse(savedLicense);
        const now = new Date();
        const expireDate = new Date(license.expire);
        
        if (now > expireDate) {
            return { valid: false, reason: 'expired' };
        }
        
        if (license.deviceId && license.deviceId !== deviceId) {
            return { valid: false, reason: 'device_mismatch' };
        }
        
        return { 
            valid: true, 
            isNew: false,
            expire: license.expire,
            deviceId: license.deviceId
        };
        
    } catch (e) {
        return { valid: false, reason: 'corrupted' };
    }
}

// ===== АКТИВАЦИЯ ЛИЦЕНЗИИ =====
function activateLicense(key, deviceId) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + VALID_LICENSE_DURATION);
    
    const license = {
        key: key,
        deviceId: deviceId,
        activateDate: new Date().toISOString(),
        expire: expireDate.toISOString(),
        deviceInfo: {
            userAgent: navigator.userAgent.substring(0, 100),
            platform: navigator.platform,
            screen: `${screen.width}x${screen.height}`
        }
    };
    
    localStorage.setItem(`license_${key}`, JSON.stringify(license));
    return license;
}

// ===== ОЧИСТКА СЕССИИ =====
function clearSession() {
    localStorage.removeItem('multitool_key');
    localStorage.removeItem('multitool_expire');
    isAuthenticated = false;
    currentUserKey = '';
    attempts = 3;
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

// ===== ПРОВЕРКА СОХРАНЕННОЙ СЕССИИ =====
function checkSavedSession() {
    const savedKey = localStorage.getItem('multitool_key');
    const savedExpire = localStorage.getItem('multitool_expire');
    
    if (savedKey && savedExpire) {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = generateDeviceId();
            localStorage.setItem('device_id', deviceId);
        }
        
        const licenseCheck = checkLicense(savedKey, deviceId);
        
        if (licenseCheck.valid) {
            currentUserKey = savedKey;
            licenseExpireDate = licenseCheck.expire || savedExpire;
            isAuthenticated = true;
            
            document.getElementById('key-system').style.display = 'none';
            startSiteLoader();
        } else {
            clearSession();
            updateAttemptsUI();
            
            let reason = '';
            switch(licenseCheck.reason) {
                case 'expired': reason = 'Лицензия истекла'; break;
                case 'device_mismatch': reason = 'Используется на другом устройстве'; break;
                default: reason = 'Необходима повторная активация';
            }
            
            showMessage(reason, 'warning');
        }
    } else {
        updateAttemptsUI();
    }
}

// ===== ПРОВЕРКА КЛЮЧА =====
function checkKey() {
    const keyInput = document.getElementById('key-input');
    const key = keyInput.value.trim().toUpperCase();
    
    removeExistingMessage();
    
    if (!key) {
        showMessage('Введите ключ!', 'warning');
        return;
    }
    
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = generateDeviceId();
        localStorage.setItem('device_id', deviceId);
    }
    
    const licenseCheck = checkLicense(key, deviceId);
    
    if (licenseCheck.valid) {
        if (licenseCheck.isNew) {
            const license = activateLicense(key, deviceId);
            showMessage('Лицензия активирована на 7 дней!', 'success');
        } else {
            const expireDate = new Date(licenseCheck.expire);
            const daysLeft = Math.ceil((expireDate - new Date()) / (1000 * 60 * 60 * 24));
            showMessage(`Лицензия активна. Осталось дней: ${daysLeft}`, 'success');
        }
        
        currentUserKey = key;
        isAuthenticated = true;
        licenseExpireDate = licenseCheck.expire || new Date(Date.now() + VALID_LICENSE_DURATION * 24 * 60 * 60 * 1000).toISOString();
        
        localStorage.setItem('multitool_key', key);
        localStorage.setItem('multitool_expire', licenseExpireDate);
        
        attempts = 3;
        updateAttemptsUI();
        
        setTimeout(() => {
            document.getElementById('key-system').style.display = 'none';
            startSiteLoader();
        }, 1500);
        
    } else {
        let errorMessage = '';
        switch(licenseCheck.reason) {
            case 'invalid_key':
                errorMessage = 'Неверный ключ!';
                break;
            case 'expired':
                errorMessage = 'Срок действия лицензии истек!';
                break;
            case 'device_mismatch':
                errorMessage = 'Ключ уже используется на другом устройстве!';
                break;
            case 'corrupted':
                errorMessage = 'Ошибка лицензии. Обратитесь к администратору.';
                break;
            default:
                errorMessage = 'Ошибка активации!';
        }
        
        attempts--;
        updateAttemptsUI();
        
        if (attempts > 0) {
            showMessage(`${errorMessage} Осталось попыток: ${attempts}`, 'warning');
            keyInput.value = '';
            keyInput.focus();
            
            keyInput.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                keyInput.style.animation = '';
            }, 500);
        } else {
            showMessage('Доступ заблокирован на 5 минут!', 'warning');
            document.getElementById('submit-key-btn').disabled = true;
            document.getElementById('key-input').disabled = true;
            
            setTimeout(() => {
                attempts = 3;
                document.getElementById('submit-key-btn').disabled = false;
                document.getElementById('key-input').disabled = false;
                removeExistingMessage();
                updateAttemptsUI();
                showMessage('Доступ восстановлен. Попробуйте снова.', 'success');
            }, 5 * 60 * 1000);
        }
    }
}

// ===== ПОКАЗАТЬ/СКРЫТЬ КЛЮЧ =====
function toggleKeyVisibility() {
    const keyInput = document.getElementById('key-input');
    const eyeBtn = document.getElementById('show-key-btn');
    const eyeIcon = eyeBtn.querySelector('i');
    
    if (keyInput.type === 'password') {
        keyInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        keyInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// ===== ОБНОВЛЕНИЕ UI ПОПЫТОК =====
function updateAttemptsUI() {
    const counter = document.querySelector('#attempts-counter span');
    const progress = document.getElementById('attempts-progress');
    
    if (counter) {
        counter.textContent = attempts;
    }
    
    if (progress) {
        progress.style.width = `${(attempts / 3) * 100}%`;
        
        if (attempts === 3) {
            progress.style.background = 'linear-gradient(90deg, #10b981, #8b5cf6)';
        } else if (attempts === 2) {
            progress.style.background = 'linear-gradient(90deg, #f59e0b, #f97316)';
        } else {
            progress.style.background = 'linear-gradient(90deg, #ef4444, #f97316)';
        }
    }
}

// ===== ПОКАЗАТЬ СООБЩЕНИЕ =====
function showMessage(text, type) {
    removeExistingMessage();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `key-${type}`;
    
    const icon = type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
    messageDiv.innerHTML = `
        <i class="${icon}"></i>
        <span>${text}</span>
    `;
    
    const keyAttempts = document.querySelector('.key-attempts');
    if (keyAttempts) {
        keyAttempts.parentNode.insertBefore(messageDiv, keyAttempts.nextSibling);
    }
}

// ===== УДАЛИТЬ СУЩЕСТВУЮЩЕЕ СООБЩЕНИЕ =====
function removeExistingMessage() {
    const existingWarning = document.querySelector('.key-warning');
    const existingSuccess = document.querySelector('.key-success');
    
    if (existingWarning) {
        existingWarning.remove();
    }
    if (existingSuccess) {
        existingSuccess.remove();
    }
}

// ===== ВЫХОД ИЗ СИСТЕМЫ =====
function logout() {
    if (confirm('Вы уверены, что хотите выйти? Сессия будет завершена на этом устройстве.')) {
        const key = localStorage.getItem('multitool_key');
        if (key) {
            localStorage.removeItem(`license_${key}`);
        }
        
        clearSession();
        
        document.getElementById('key-system').style.display = 'flex';
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('site-loader').style.display = 'none';
        
        const keyInput = document.getElementById('key-input');
        if (keyInput) {
            keyInput.value = '';
            keyInput.type = 'password';
        }
        
        const showKeyBtn = document.getElementById('show-key-btn');
        if (showKeyBtn) {
            showKeyBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
        
        const submitBtn = document.getElementById('submit-key-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        
        if (keyInput) {
            keyInput.disabled = false;
        }
        
        updateAttemptsUI();
        removeExistingMessage();
        
        showToast('Вы вышли из системы. Лицензия освобождена.');
    }
}

// ===== ПРЕЛОАДЕР САЙТА =====
function startSiteLoader() {
    const loader = document.getElementById('site-loader');
    const progressBar = document.getElementById('site-progress');
    const timer = document.getElementById('site-loader-timer');
    const mainContent = document.getElementById('main-content');
    
    if (loader) {
        loader.classList.remove('hidden');
    }
    
    let progress = 0;
    const steps = 4;
    const totalTime = 3500;
    const stepTime = totalTime / steps;
    
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

// ===== ОБНОВЛЕНИЕ ИНФОРМАЦИИ О ЛИЦЕНЗИИ =====
function updateLicenseInfo() {
    if (currentUserKey && licenseExpireDate) {
        const displayKey = currentUserKey.replace(/(.{4})/g, '$1-').slice(0, -1);
        const expireDate = new Date(licenseExpireDate);
        const now = new Date();
        const daysLeft = Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24));
        
        const formattedDate = expireDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const deviceId = localStorage.getItem('device_id') || 'Неизвестно';
        
        const elements = {
            'user-key': displayKey,
            'expire-date': formattedDate,
            'device-id': deviceId,
            'days-left': daysLeft > 0 ? daysLeft : 'Истек'
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                
                if (id === 'days-left') {
                    if (daysLeft <= 3) {
                        element.style.color = '#ef4444';
                    } else if (daysLeft <= 7) {
                        element.style.color = '#f59e0b';
                    } else {
                        element.style.color = '#10b981';
                    }
                }
            }
        }
    }
}

// ===== ПРОВЕРКА ЛИЦЕНЗИИ В РЕАЛЬНОМ ВРЕМЕНИ =====
function startLicenseChecker() {
    setInterval(() => {
        if (isAuthenticated && licenseExpireDate) {
            const now = new Date();
            const expireDate = new Date(licenseExpireDate);
            
            if (now > expireDate) {
                showToast('Лицензия истекла! Перезайдите в систему.');
                logout();
            } else {
                const hoursLeft = Math.ceil((expireDate - now) / (1000 * 60 * 60));
                if (hoursLeft <= 24) {
                    showToast(`Лицензия истекает через ${hoursLeft} часов`);
                }
            }
        }
    }, 30 * 60 * 1000);
}

// ===== ИНИЦИАЛИЗАЦИЯ ОСНОВНОГО ПРИЛОЖЕНИЯ =====
function initMainApp() {
    updateLicenseInfo();
    startLicenseChecker();
    
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
    
    loadHistory();
    
    document.getElementById('standoff-btn').addEventListener('click', handleStandoff);
    document.getElementById('generate-link-btn').addEventListener('click', generateLink);
    document.getElementById('copy-link-btn').addEventListener('click', copyLink);
    document.getElementById('generate-md5-btn').addEventListener('click', generateMD5);
    document.getElementById('copy-md5-btn').addEventListener('click', copyMD5);
    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
    document.getElementById('refresh-history-btn').addEventListener('click', loadHistory);
    document.getElementById('close-alert-btn').addEventListener('click', closeAlert);
    
    if (document.getElementById('logout-btn')) {
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
    
    setTimeout(() => {
        showToast('Готово к работе!');
    }, 500);
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

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
document.addEventListener('DOMContentLoaded', function() {
    createStarfield();
    
    setInterval(() => {
        createStarfield();
    }, 60000);
    
    checkSavedSession();
    
    document.getElementById('submit-key-btn').addEventListener('click', checkKey);
    document.getElementById('show-key-btn').addEventListener('click', toggleKeyVisibility);
    document.getElementById('key-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkKey();
        }
    });
    
    if (document.getElementById('logout-btn')) {
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
});
