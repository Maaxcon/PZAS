document.addEventListener('DOMContentLoaded', function() {
    // Завантажимо новини з JSON файлу
    fetch('/newsPage.json')
        .then(response => response.json())
        .then(data => {
            displayFeaturedNews(data.featuredNews);
            displayLatestNews(data.latestNews);
        })
        .catch(error => {
            console.error('Помилка завантаження новин:', error);
            document.getElementById('featured-news').innerHTML = '<p>Помилка завантаження новин. Спробуйте пізніше.</p>';
            document.getElementById('news-list').innerHTML = '<p>Помилка завантаження новин. Спробуйте пізніше.</p>';
        });
});

// Функція для відображення головної (актуальної) новини
function displayFeaturedNews(featuredNews) {
    const featuredNewsContainer = document.getElementById('featured-news');
    
    if (!featuredNews) {
        featuredNewsContainer.innerHTML = '<p>Немає головних новин.</p>';
        return;
    }

    const date = new Date(featuredNews.date);
    const formattedDate = date.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const newsHTML = `
        <div class="news-card">
            <h3 class="news-card-title">${featuredNews.title}</h3>
            <div class="news-card-date">${formattedDate}</div>
            <p class="news-card-description">${featuredNews.content}</p>
            <a href="/articlePage.html?id=${featuredNews.id}" class="news-read-more">Читати більше</a>

        </div>
    `;
    
    featuredNewsContainer.innerHTML = newsHTML;
}

// Функція для відображення останніх новин
function displayLatestNews(latestNews) {
    const newsListContainer = document.getElementById('news-list');
    
    if (!latestNews || latestNews.length === 0) {
        newsListContainer.innerHTML = '<p>Немає останніх новин.</p>';
        return;
    }

    let newsHTML = '';
    
    latestNews.forEach(news => {
        const date = new Date(news.date);
        const day = date.getDate();
        const month = date.toLocaleDateString('uk-UA', { month: 'short' });
        
        newsHTML += `
            <div class="latest-news-item">
                <div class="news-date">
                    <div class="day">${day}</div>
                    <div class="month">${month}</div>
                </div>
                <div class="news-title">
                    <a href="/articlePage.html?id=${news.id}">${news.title}</a>

                </div>
            </div>
        `;
    });
    
    newsListContainer.innerHTML = newsHTML;
}
