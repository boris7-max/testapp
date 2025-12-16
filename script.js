// ===== КЛЮЧЕВАЯ СИСТЕМА =====
const VALID_KEYS = [
    "BRAIN-N7P9R1T3V5X7Z9B1D3F5H7"
];

// ===== ПЕРЕМЕННЫЕ =====
let attempts = 3;
let isAuthenticated = false;
let currentUserKey = '';
let history = JSON.parse(localStorage.getItem('multitool_history') || '[]');
let licenseExpireDate = '';

// ===== СОЗДАНИЕ ЗВЕЗДНОГО ПОЛЯ =====
function createStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;
    
    const starCount = 80; // Меньше звезд для легкого эффекта
    
    // Очищаем старые звезды (если есть)
    starfield.innerHTML = '';
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        
        // Случайный размер звезды (все маленькие)
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
        
        // Случайная позиция
        const left = Math.random() * 100;
        const startTop = Math.random() * 100;
        
        // Случайная скорость падения (очень медленно)
        const duration = Math.random() * 20 + 40; // 40-60 секунд
        const delay = Math.random() * 15; // Большая задержка
        
        // Случайная частота мерцания
        const twinkleDuration = Math.random() * 4 + 3; // 3-7 секунд
        
        // Случайное направление падения
        const direction = Math.random() * 8 - 4; // -4px до +4px
        
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

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
document.addEventListener('DOMContentLoaded', function() {
    // Создаем звездное поле
    createStarfield();
    
    // Обновляем звезды каждую минуту для разнообразия
    setInterval(() => {
        createStarfield();
    }, 60000);
    
    // Проверяем сохраненную сессию
    checkSavedSession();
    
    // Назначаем обработчики для ключевой системы
    document.getElementById('submit-key-btn').addEventListener('click', checkKey);
    document.getElementById('show-key-btn').addEventListener('click', toggleKeyVisibility);
    document.getElementById('key-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkKey();
        }
    });
    
    // Обработчик выхода
    if (document.getElementById('logout-btn')) {
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
});

// ===== ПРОВЕРКА СОХРАНЕННОЙ СЕССИИ =====
function checkSavedSession() {
    const savedKey = localStorage.getItem('multitool_key');
    const savedExpire = localStorage.getItem('multitool_expire');
    
    if (savedKey && savedExpire) {
        // Проверяем не истекла ли лицензия
        const now = new Date();
        const expireDate = new Date(savedExpire);
        
        if (now < expireDate && VALID_KEYS.includes(savedKey)) {
            // Сессия активна
            currentUserKey = savedKey;
            licenseExpireDate = savedExpire;
            isAuthenticated = true;
            
            // Прячем ключевую систему и запускаем прелоадер
            document.getElementById('key-system').style.display = 'none';
            startSiteLoader();
        } else {
            // Сессия истекла
            localStorage.removeItem('multitool_key');
            localStorage.removeItem('multitool_expire');
            updateAttemptsUI();
        }
    } else {
        // Нет сохраненной сессии
        updateAttemptsUI();
    }
}

// ===== ПРОВЕРКА КЛЮЧА (ИСПРАВЛЕННАЯ) =====
function checkKey() {
    const keyInput = document.getElementById('key-input');
    const key = keyInput.value.trim().toUpperCase();
    
    // Удаляем старое сообщение, если есть
    removeExistingMessage();
    
    if (!key) {
        showMessage('Введите ключ!', 'warning');
        return;
    }
    
    if (VALID_KEYS.includes(key)) {
        // Ключ верный
        currentUserKey = key;
        isAuthenticated = true;
        
        // Генерируем дату истечения (30 дней от текущей даты)
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 7);
        licenseExpireDate = expireDate.toISOString();
        
        // Сохраняем в localStorage
        localStorage.setItem('multitool_key', key);
        localStorage.setItem('multitool_expire', licenseExpireDate);
        
        // Показываем сообщение об успехе
        showMessage('Ключ принят! Загрузка программы...', 'success');
        
        // Сбрасываем попытки
        attempts = 3;
        updateAttemptsUI();
        
        // Через 1.5 секунды скрываем ключевую систему и запускаем прелоадер
        setTimeout(() => {
            document.getElementById('key-system').style.display = 'none';
            startSiteLoader();
        }, 1500);
        
    } else {
        // Неверный ключ
        attempts--;
        updateAttemptsUI();
        
        if (attempts > 0) {
            showMessage(`Неверный ключ! Осталось попыток: ${attempts}`, 'warning');
            keyInput.value = '';
            keyInput.focus();
            
            // Анимация встряски
            keyInput.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                keyInput.style.animation = '';
            }, 500);
        } else {
            // Попытки закончились
            showMessage('Доступ заблокирован на 5 минут! Свяжитесь с администратором.', 'warning');
            document.getElementById('submit-key-btn').disabled = true;
            document.getElementById('key-input').disabled = true;
            
            // Блокировка на 5 минут
            setTimeout(() => {
                attempts = 3;
                document.getElementById('submit-key-btn').disabled = false;
                document.getElementById('key-input').disabled = false;
                removeExistingMessage();
                updateAttemptsUI();
                showMessage('Доступ восстановлен. Попробуйте снова.', 'success');
            }, 5 * 60 * 1000); // 5 минут
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
        
        // Меняем цвет в зависимости от количества попыток
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
    // Удаляем старое сообщение
    removeExistingMessage();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `key-${type}`;
    
    const icon = type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
    messageDiv.innerHTML = `
        <i class="${icon}"></i>
        <span>${text}</span>
    `;
    
    // Вставляем после key-attempts
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
    if (confirm('Вы уверены, что хотите выйти? Все данные сессии будут удалены.')) {
        // Очищаем localStorage
        localStorage.removeItem('multitool_key');
        localStorage.removeItem('multitool_expire');
        
        // Сбрасываем переменные
        isAuthenticated = false;
        currentUserKey = '';
        attempts = 3;
        
        // Показываем ключевую систему
        document.getElementById('key-system').style.display = 'flex';
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('site-loader').style.display = 'none';
        
        // Сбрасываем поля
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
        
        // Обновляем UI
        updateAttemptsUI();
        removeExistingMessage();
        
        showToast('Вы вышли из системы');
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
                    
                    // Инициализируем основной функционал
                    initMainApp();
                }, 500);
            }, 300);
        }
    }, 100);
}

// ===== ИНИЦИАЛИЗАЦИЯ ОСНОВНОГО ПРИЛОЖЕНИЯ =====
function initMainApp() {
    // Обновляем информацию о лицензии
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
    
    // Обработчик выхода
    if (document.getElementById('logout-btn')) {
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
    
    // Показываем приветственное уведомление
    setTimeout(() => {
        showToast('Готово к работе!');
    }, 500);
}

// ===== ОБНОВЛЕНИЕ ИНФОРМАЦИИ О ЛИЦЕНЗИИ =====
function updateLicenseInfo() {
    if (currentUserKey && licenseExpireDate) {
        // Форматируем ключ для отображения
        const displayKey = currentUserKey.replace(/(.{4})/g, '$1-').slice(0, -1);
        
        // Форматируем дату
        const expireDate = new Date(licenseExpireDate);
        const formattedDate = expireDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Обновляем UI
        const userKeyElement = document.getElementById('user-key');
        const expireDateElement = document.getElementById('expire-date');
        
        if (userKeyElement) {
            userKeyElement.textContent = displayKey;
        }
        
        if (expireDateElement) {
            expireDateElement.textContent = formattedDate;
        }
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
