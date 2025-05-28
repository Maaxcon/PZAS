// script/page-interactions.js

document.addEventListener('DOMContentLoaded', () => {
    // --- КОД ДЛЯ АКТИВНОЇ НАВІГАЦІЇ (SCROLL-SPY) ТА ПЛАВНОЇ ПРОКРУТКИ ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-container .nav-link'); 

    function changeNavActiveState() {
        let currentSectionId = '';
        // Визначаємо середину вікна для більш точного визначення активної секції
        let scrollPosition = window.scrollY + window.innerHeight / 2; 

        sections.forEach(section => {
            // Якщо верхня межа секції вище або на рівні scrollPosition,
            // і нижня межа секції (offsetTop + offsetHeight) нижче scrollPosition,
            // то ця секція вважається поточною.
            // Або просто беремо останню секцію, верхівка якої пройдена.
            if (scrollPosition >= section.offsetTop) {
                currentSectionId = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });

        // Обробка "Головна", якщо ми ще не дійшли до першої секції або на самому верху
        if (!currentSectionId && window.scrollY < (sections[0] ? sections[0].offsetTop : window.innerHeight / 3)) {
            const homeLink = document.querySelector('.nav-container .nav-link[href="#video-hero"]');
            if (homeLink) {
                navLinks.forEach(link => link.classList.remove('active')); 
                homeLink.classList.add('active');
            }
        }
    }

    if (sections.length && navLinks.length) {
        changeNavActiveState(); 
        window.addEventListener('scroll', changeNavActiveState);
        window.addEventListener('resize', changeNavActiveState); 
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            if (targetId.length > 1 && targetId.startsWith('#')) {
                e.preventDefault(); 
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const header = document.querySelector('.header'); 
                    const headerHeight = header ? header.offsetHeight : 0;
                    
                    let elementPosition = targetElement.getBoundingClientRect().top;
                    let offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                    if (targetId === '#video-hero') {
                        offsetPosition = 0; // Прокрутка до самого верху для hero секції
                    }
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Автоматичне закриття мобільного меню при кліку на якір
                    const hamburgerButton = document.querySelector('.hamburger-menu');
                    const navList = document.querySelector('.nav-container .list');
                    if (hamburgerButton && navList && navList.classList.contains('active')) {
                        hamburgerButton.setAttribute('aria-expanded', 'false');
                        navList.classList.remove('active');
                        // document.body.classList.remove('no-scroll'); // Якщо використовуєте блокування прокрутки
                    }
                } else {
                    console.warn(`Елемент з ID "${targetId}" не знайдено для плавної прокрутки.`);
                }
            }
            // Якщо це не якірне посилання (наприклад, /html-page/121), браузер перейде за ним стандартно
        });
    });
    // --- КІНЕЦЬ КОДУ ДЛЯ АКТИВНОЇ НАВІГАЦІЇ ТА ПЛАВНОЇ ПРОКРУТКИ ---


    // --- КОД ДЛЯ ВІДОБРАЖЕННЯ НОВИН В .facts-container ---
    async function fetchNewsDataForFacts() {
        try {
            const response = await fetch('/newsPage.json'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.latestNews || []; 
        } catch (error) {
            console.error("Не вдалося завантажити новини для секції 'Актуальне':", error);
            return [];
        }
    }

    function renderNewsInFactsContainer(newsItems) {
        const factsContainer = document.querySelector('.facts-section .facts-container');
        if (!factsContainer) {
            console.error("Контейнер .facts-section .facts-container не знайдено!");
            return;
        }
        factsContainer.innerHTML = ''; 

        const newsToShow = newsItems.slice(0, 3); 

        if (newsToShow.length === 0 && factsContainer) {
            // Можна додати повідомлення, якщо новин немає
            // factsContainer.innerHTML = '<p class="no-news-message">Наразі немає актуальних новин.</p>';
            return;
        }

        newsToShow.forEach(news => {
            const newsCard = document.createElement('article');
            newsCard.className = 'news-card-in-facts'; 

            const link = document.createElement('a');
            // ОНОВЛЕНО: Формуємо посилання відповідно до потрібного формату
            // Припускаємо, що articlePage.html знаходиться в корені, доступному через /
            link.href = `/articlePage.html?id=${news.id}`; 
            link.className = 'news-card-link-wrapper'; 
            // Розкоментуйте, якщо хочете відкривати статті в новій вкладці
            // link.target = '_blank';
            // link.rel = 'noopener noreferrer';


            const imageContainer = document.createElement('div');
            imageContainer.className = 'news-card-image-container';
            
            const image = document.createElement('img');
            image.src = news.image || '/img-main-page/placeholder-news.jpg'; 
            image.alt = news.title || 'Зображення новини';

            imageContainer.appendChild(image);

            const title = document.createElement('h3');
            title.textContent = news.title;
            
            if (news.date) {
                const dateElement = document.createElement('p');
                dateElement.className = 'news-card-date';
                const dateObj = new Date(news.date);
                dateElement.textContent = dateObj.toLocaleDateString('uk-UA', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });
                link.appendChild(dateElement); 
            }

            link.appendChild(imageContainer); 
            link.appendChild(title);       
            
            newsCard.appendChild(link);
            factsContainer.appendChild(newsCard);
        });
    }

    // Завантажуємо та відображаємо новини для секції "Актуальне"
    fetchNewsDataForFacts().then(latestNews => {
        renderNewsInFactsContainer(latestNews);
    });
    // --- КІНЕЦЬ КОДУ ДЛЯ ВІДОБРАЖЕННЯ НОВИН В .facts-container ---
});