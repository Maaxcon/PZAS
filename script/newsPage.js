document.addEventListener('DOMContentLoaded', function() { 
    fetch('/newsPage.json') // Переконайтеся, що шлях правильний
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.featuredNews) {
                displayFeaturedNews(data.featuredNews);
            } else {
                const featuredContainer = document.getElementById('featured-news');
                if (featuredContainer) featuredContainer.innerHTML = '<p>Немає головних новин.</p>';
            }
            if (data.latestNews) {
                displayLatestNews(data.latestNews);
            } else {
                const latestContainer = document.getElementById('news-list');
                if (latestContainer) latestContainer.innerHTML = '<p>Немає останніх новин.</p>';
            }
        })
        .catch(error => {
            console.error('Помилка завантаження новин:', error);
            const featuredContainer = document.getElementById('featured-news');
            const latestContainer = document.getElementById('news-list');
            if (featuredContainer) featuredContainer.innerHTML = `<p>Помилка завантаження головних новин: ${error.message}. Спробуйте пізніше.</p>`;
            if (latestContainer) latestContainer.innerHTML = `<p>Помилка завантаження останніх новин: ${error.message}. Спробуйте пізніше.</p>`;
        });
});

// Функція для відображення головної (актуальної) новини
function displayFeaturedNews(featuredNews) {
    const featuredNewsContainer = document.getElementById('featured-news');
    
    if (!featuredNewsContainer) {
        console.error("Контейнер #featured-news не знайдено!");
        return;
    }

    const date = new Date(featuredNews.date);
    const formattedDate = date.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Додаємо зображення, якщо воно є
    const imageHTML = featuredNews.image 
        ? `<a href="/articlePage.html?id=${featuredNews.id}" class="news-card-image-link"><img src="${featuredNews.image}" alt="${featuredNews.title}" class="news-card-image"></a>` 
        : '';

    const newsHTML = `
        <div class="news-card featured"> <!-- Додано клас featured для можливої окремої стилізації -->
            ${imageHTML} 
            <div class="news-card-content">
                <h3 class="news-card-title">
                    <a href="/articlePage.html?id=${featuredNews.id}">${featuredNews.title}</a>
                </h3>
                <div class="news-card-date">${formattedDate}</div>
                <p class="news-card-description">${featuredNews.content || ''}</p> 
                <a href="/articlePage.html?id=${featuredNews.id}" class="news-read-more">Читати більше →</a>
            </div>
        </div>
    `;
    
    featuredNewsContainer.innerHTML = newsHTML;
}

// Функція для відображення останніх новин
function displayLatestNews(latestNews) {
    const newsListContainer = document.getElementById('news-list');

    if (!newsListContainer) {
        console.error("Контейнер #news-list не знайдено!");
        return;
    }
    
    if (!latestNews || latestNews.length === 0) {
        newsListContainer.innerHTML = '<p>Немає останніх новин.</p>';
        return;
    }

    // Показати, наприклад, останні 5 новин (або скільки є, якщо менше 5)
    // Якщо потрібно більше, змініть .slice()
    const latestToShow = latestNews.slice(0, 5); // Беремо перші 5, якщо latestNews вже відсортований від нових до старих
                                                 // Якщо latestNews відсортований від старих до нових, то:
                                                 // const latestToShow = latestNews.slice(-5).reverse();


    let newsHTML = '';
    
    latestToShow.forEach(news => {
        const date = new Date(news.date);
        const day = date.getDate();
        // Для місяця можна використовувати короткий формат або повний
        const month = date.toLocaleDateString('uk-UA', { month: 'short' }).replace('.', ''); // 'січ.', 'лют.' і т.д.
        
        // Додаємо мініатюру зображення, якщо воно є
        const imageThumbnailHTML = news.image 
            ? `<a href="/articlePage.html?id=${news.id}" class="latest-news-image-link">
                   <img src="${news.image}" alt="${news.title}" class="latest-news-thumbnail">
               </a>` 
            : '<div class="latest-news-image-placeholder"></div>'; // Заглушка, якщо зображення немає

        newsHTML += `
            <div class="latest-news-item">
                ${imageThumbnailHTML}
                <div class="latest-news-info">
                    <div class="news-date-condensed"> 
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <h4 class="news-title"> 
                        <a href="/articlePage.html?id=${news.id}">${news.title}</a>
                    </h4>
                </div>
            </div>
        `;
    });
    
    newsListContainer.innerHTML = newsHTML;
}