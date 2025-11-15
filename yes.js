let moodLevel = 0;
let score = 0;
let bubbleInterval;
let gameTimeout;
let isPlaying = false;
let currentSong = 0;
let secretSectionRevealed = false;

// Обновленный плейлист
const songs = [
    { title: "Aarne, Toxi$, Markul - CULTURE", url: "Aarne, Toxi$, Markul - CULTURE.mp3" },
    { title: "Егор Крид - Malo", url: "ЕГОР КРИД - Malo.mp3" },
    { title: "Егор Крид - PUSSY BOY", url: "ЕГОР КРИД - PUSSY BOY.mp3" }
];

// Аудио элемент
const audio = new Audio();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Создание плавающих сердечек
    createFloatingHearts();

    // Обработчики событий
    document.getElementById('startBtn').addEventListener('click', improveMood);
    document.getElementById('startBubbleGame').addEventListener('click', startBubbleGame);
    document.getElementById('newQuoteBtn').addEventListener('click', showNewQuote);
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('prevBtn').addEventListener('click', prevSong);
    document.getElementById('nextBtn').addEventListener('click', nextSong);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('closeSurpriseBtn').addEventListener('click', closeModal);

    // Секретный раздел при тройном клике (только если еще не открыт)
    let clickCount = 0;
    let clickTimer;
    document.addEventListener('click', function(e) {
        // Игнорируем клики по кнопкам и интерактивным элементам
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) {
            return;
        }

        if (secretSectionRevealed) return;

        clickCount++;

        if (clickTimer) clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 1000);

        if (clickCount === 3) {
            secretSectionRevealed = true;
            document.getElementById('secretSection').style.display = 'block';
            createConfetti();
            clickCount = 0;

            // Прокрутка к секретному разделу
            document.getElementById('secretSection').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Анимация появления элементов при прокрутке
    animateOnScroll();

    // Предотвращение горизонтального скролла
    document.body.addEventListener('touchmove', function(e) {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    initClicker();
});

// Создание плавающих сердечек
function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const heartsCount = window.innerWidth < 768 ? 15 : 20;

    for (let i = 0; i < heartsCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 5 + 's';
        heart.style.fontSize = (Math.random() * 10 + 12) + 'px';
        heart.style.color = `rgba(255, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 0.5 + 0.5})`;

        container.appendChild(heart);
    }
}

// Улучшение настроения
function improveMood() {
    moodLevel += 10;
    if (moodLevel > 100) moodLevel = 100;

    document.getElementById('moodBar').style.width = moodLevel + '%';

    const moodText = document.getElementById('moodText');
    if (moodLevel < 30) {
        moodText.textContent = 'Твоё настроение: Можно лучше!';
    } else if (moodLevel < 70) {
        moodText.textContent = 'Твоё настроение: Уже неплохо!';
    } else {
        moodText.textContent = 'Твоё настроение: Отлично!';
    }

    // Анимация кнопки
    const btn = document.getElementById('startBtn');
    btn.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        btn.style.animation = '';
    }, 500);

    // Создание конфетти при достижении 100%
    if (moodLevel === 100) {
        createConfetti();
        document.getElementById('surpriseModal').style.display = 'flex';
    }
}

// Создание конфетти
function createConfetti() {
    const colors = ['#ff6b6b', '#ff8e8e', '#6a5acd', '#9370db', '#ffd700', '#00ff00', '#00ffff'];
    const confettiCount = window.innerWidth < 768 ? 100 : 150;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = (Math.random() * 8 + 4) + 'px';
        confetti.style.height = (Math.random() * 8 + 4) + 'px';
        confetti.style.animationDelay = Math.random() * 5 + 's';

        document.body.appendChild(confetti);

        // Удаление конфетти после анимации
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 5000);
    }
}

// Игра с пузырьками
function startBubbleGame() {
    const gameContainer = document.querySelector('.bubble-game');
    const startBtn = document.getElementById('startBubbleGame');

    // Очистка предыдущих пузырьков
    const existingBubbles = document.querySelectorAll('.bubble');
    existingBubbles.forEach(bubble => {
        if (bubble.parentNode) {
            bubble.remove();
        }
    });

    // Очистка предыдущих таймеров
    if (bubbleInterval) {
        clearInterval(bubbleInterval);
    }
    if (gameTimeout) {
        clearTimeout(gameTimeout);
    }

    // Сброс счета
    score = 0;
    document.getElementById('score').textContent = score;

    // Скрытие кнопки
    startBtn.style.display = 'none';

    // Создание пузырьков
    bubbleInterval = setInterval(() => {
        createBubble(gameContainer);
    }, 600);

    // Остановка игры через 30 секунд
    gameTimeout = setTimeout(() => {
        stopBubbleGame();
    }, 30000);
}

// Остановка игры с пузырьками
function stopBubbleGame() {
    if (bubbleInterval) {
        clearInterval(bubbleInterval);
        bubbleInterval = null;
    }

    const startBtn = document.getElementById('startBubbleGame');
    startBtn.style.display = 'inline-block';
    startBtn.textContent = 'Играть снова';

    // Показать результат
    if (score > 20) {
        alert(`Отлично! Ты набрала ${score} очков! Ты настоящий чемпион!`);
    } else if (score > 10) {
        alert(`Хорошо! Ты набрала ${score} очков!`);
    } else {
        alert(`Ты набрала ${score} очков! Попробуй еще раз!`);
    }
}

// Создание пузырька
function createBubble(container) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const size = Math.random() * 40 + 25;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * 85 + '%';
    bubble.style.background = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`;
    bubble.style.animationDuration = (Math.random() * 5 + 3) + 's';
    bubble.style.animationDelay = Math.random() * 2 + 's';

    bubble.addEventListener('click', function() {
        score++;
        document.getElementById('score').textContent = score;

        // Анимация при лопании
        this.style.transform = 'scale(1.3)';
        this.style.opacity = '0';

        setTimeout(() => {
            if (this.parentNode) {
                this.remove();
            }
        }, 300);
    });

    container.appendChild(bubble);

    // Автоматическое удаление пузырька через 8 секунд
    setTimeout(() => {
        if (bubble.parentNode) {
            bubble.remove();
        }
    }, 8000);
}

// Показать новую цитату
function showNewQuote() {
    const quotes = [
        {
            text: "Жизнь - это то, что происходит с тобой, пока ты строишь другие планы.",
            author: "Джон Леннон"
        },
        {
            text: "Единственный способ сделать большую работу - полюбить её.",
            author: "Стив Джобс"
        },
        {
            text: "Будь собой, все остальные роли уже заняты.",
            author: "Оскар Уайльд"
        },
        {
            text: "Успех - это способность переходить от одной неудачи к другой без потери энтузиазма.",
            author: "Уинстон Черчилль"
        },
        {
            text: "Лучший способ предсказать будущее - создать его.",
            author: "Питер Друкер"
        }
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const quoteContainer = document.querySelector('.quotes');

    // Создание новой цитаты
    const newQuote = document.createElement('div');
    newQuote.className = 'quote';
    newQuote.style.animation = 'fadeIn 1s ease-out';
    newQuote.innerHTML = `
                <p>"${randomQuote.text}"</p>
                <p>- ${randomQuote.author}</p>
            `;

    // Добавление новой цитаты и удаление старой
    quoteContainer.appendChild(newQuote);
    if (quoteContainer.children.length > 3) {
        quoteContainer.removeChild(quoteContainer.children[0]);
    }
}

// Управление музыкой
function togglePlay() {
    const playBtn = document.getElementById('playBtn');

    if (!isPlaying) {
        audio.src = songs[currentSong].url;
        audio.play();
        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        document.getElementById('songTitle').textContent = songs[currentSong].title;
    } else {
        audio.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function prevSong() {
    currentSong--;
    if (currentSong < 0) currentSong = songs.length - 1;

    if (isPlaying) {
        audio.src = songs[currentSong].url;
        audio.play();
        document.getElementById('songTitle').textContent = songs[currentSong].title;
    }
}

function nextSong() {
    currentSong++;
    if (currentSong >= songs.length) currentSong = 0;

    if (isPlaying) {
        audio.src = songs[currentSong].url;
        audio.play();
        document.getElementById('songTitle').textContent = songs[currentSong].title;
    }
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('surpriseModal').style.display = 'none';
}

// Анимация при прокрутке
function animateOnScroll() {
    const elements = document.querySelectorAll('section, .gallery-item, .positive-card, .quote');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 1s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
}

// Кликер игра
let happinessPoints = 0;
let clickPower = 1;
let autoClickers = 0;
let clickCount = 0;
let autoClickInterval;

// Инициализация кликера после загрузки DOM
function initClicker() {
    console.log('Инициализация кликера...');

    const clickerHeart = document.getElementById('clickerHeart');
    const upgradeClick = document.getElementById('upgradeClick');
    const upgradeAutoClick = document.getElementById('upgradeAutoClick');
    const upgradeMegaClick = document.getElementById('upgradeMegaClick');

    if (!clickerHeart) {
        console.error('Элемент clickerHeart не найден!');
        return;
    }

    clickerHeart.addEventListener('click', handleClick);
    upgradeClick.addEventListener('click', upgradeClickHandler);
    upgradeAutoClick.addEventListener('click', buyAutoClicker);
    upgradeMegaClick.addEventListener('click', buyMegaClick);

    // Обновляем отображение улучшений
    updateUpgrades();
    updateClickerDisplay();

    console.log('Кликер инициализирован успешно!');
}

// Обработчик клика
function handleClick(event) {
    happinessPoints += clickPower;
    clickCount++;

    // Анимация сердечка
    const heart = event.currentTarget;
    heart.style.transform = 'scale(0.9)';
    setTimeout(() => {
        heart.style.transform = 'scale(1)';
    }, 100);

    // Создание летающего числа
    createFloatingNumber(clickPower, event.clientX, event.clientY);

    updateClickerDisplay();
}

// Создание летающего числа
function createFloatingNumber(value, x, y) {
    const number = document.createElement('div');
    number.textContent = '+' + value;
    number.style.position = 'fixed';
    number.style.left = x + 'px';
    number.style.top = y + 'px';
    number.style.color = '#ff6b6b';
    number.style.fontWeight = 'bold';
    number.style.fontSize = '1.5rem';
    number.style.pointerEvents = 'none';
    number.style.zIndex = '1000';
    number.style.animation = 'floatNumber 1s ease-out forwards';

    document.body.appendChild(number);

    setTimeout(() => {
        if (number.parentNode) {
            number.remove();
        }
    }, 1000);
}

// Обновление отображения
function updateClickerDisplay() {
    const happinessPointsEl = document.getElementById('happinessPoints');
    const clickPowerEl = document.getElementById('clickPower');
    const autoClickersEl = document.getElementById('autoClickers');
    const clickCountEl = document.getElementById('clickCount');

    if (happinessPointsEl) happinessPointsEl.textContent = happinessPoints;
    if (clickPowerEl) clickPowerEl.textContent = clickPower;
    if (autoClickersEl) autoClickersEl.textContent = autoClickers;
    if (clickCountEl) clickCountEl.textContent = clickCount;

    updateUpgrades();
}

// Обновление кнопок улучшений
function updateUpgrades() {
    const upgradeClick = document.getElementById('upgradeClick');
    const upgradeAutoClick = document.getElementById('upgradeAutoClick');
    const upgradeMegaClick = document.getElementById('upgradeMegaClick');

    if (upgradeClick) {
        upgradeClick.disabled = happinessPoints < 10;
        upgradeClick.textContent = `Улучшить клик (+1) - 10 очков`;
    }

    if (upgradeAutoClick) {
        upgradeAutoClick.disabled = happinessPoints < 50;
        upgradeAutoClick.textContent = `Купить авто-кликер - 50 очков`;
    }

    if (upgradeMegaClick) {
        upgradeMegaClick.disabled = happinessPoints < 100;
        upgradeMegaClick.textContent = `Мега-клик (x2) - 100 очков`;
    }
}

// Улучшение клика
function upgradeClickHandler() {
    if (happinessPoints >= 10) {
        happinessPoints -= 10;
        clickPower += 1;
        showNotification('Сила клика увеличена!');
        updateClickerDisplay();
    }
}

// Покупка авто-кликера
function buyAutoClicker() {
    if (happinessPoints >= 50) {
        happinessPoints -= 50;
        autoClickers += 1;

        // Останавливаем предыдущий интервал если есть
        if (autoClickInterval) {
            clearInterval(autoClickInterval);
        }

        // Запускаем авто-клики
        autoClickInterval = setInterval(() => {
            happinessPoints += autoClickers;
            updateClickerDisplay();
        }, 1000);

        showNotification('Авто-кликер куплен!');
        updateClickerDisplay();
    }
}

// Покупка мега-клика
function buyMegaClick() {
    if (happinessPoints >= 100) {
        happinessPoints -= 100;
        clickPower *= 2;
        showNotification('Мега-клик активирован! Сила клика удвоена!');
        updateClickerDisplay();
    }
}

// Показать уведомление
function showNotification(message) {
    // Удаляем предыдущие уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.remove();
        }
    });

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '10px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.zIndex = '1000';
    notification.style.animation = 'slideInRight 0.5s ease';

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}