// /script/article.js

document.addEventListener("DOMContentLoaded", () => {
  const articleContainer = document.getElementById("article-container");
  const pageTitle = document.querySelector("title"); // Для зміни заголовка вкладки

  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id");

  if (!articleId) {
    articleContainer.innerHTML = `
      <div class="article-error">
        <h2>Помилка</h2>
        <p>Новину не знайдено. Не вказано ID статті.</p>
        <a href="/html-page/newsPage" class="back-to-news">← Повернутися до новин</a>
      </div>`;
    if(pageTitle) pageTitle.textContent = "Новину не знайдено | Кафедра ПЗАС";
    return;
  }

  fetch("/newsPage.json") // Переконайтеся, що шлях до newsPage.json правильний
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Помилка завантаження новин: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      const allNews = [data.featuredNews, ...data.latestNews].filter(item => item); // Фільтруємо, щоб уникнути null/undefined, якщо featuredNews немає
      const article = allNews.find((item) => item && item.id === Number(articleId));

      if (!article) {
        articleContainer.innerHTML = `
          <div class="article-error">
            <h2>Помилка</h2>
            <p>Новину з ID ${articleId} не знайдено.</p>
            <a href="/html-page/newsPage" class="back-to-news">← Повернутися до новин</a>
          </div>`;
        if(pageTitle) pageTitle.textContent = "Новину не знайдено | Кафедра ПЗАС";
        return;
      }

      // Оновлюємо заголовок вкладки браузера
      if(pageTitle) pageTitle.textContent = `${article.title} | Кафедра ПЗАС`;

      // Формуємо HTML для статті
      let articleHTML = `
        <article class="article-content-wrapper">
            <h1 class="article-title">${article.title}</h1>
            <p class="article-meta">
                <span class="article-date">${formatDate(article.date)}</span>
            </p>`;

      if (article.image) {
        articleHTML += `
            <div class="article-image-container">
                <img src="${article.image}" alt="${article.title}" class="article-image">
            </div>`;
      }

      // Розділяємо контент на абзаци, якщо він суцільний текст
      // Або використовуємо його як є, якщо він вже містить HTML-розмітку
      let contentHTML = '';
      if (article.content) {
          if (article.content.includes('<p>') || article.content.includes('<div>')) {
              // Якщо контент вже містить HTML, вставляємо як є
              contentHTML = article.content;
          } else {
              // Якщо це простий текст, розділяємо на абзаци
              contentHTML = article.content.split('\n\n') // Розділяємо по подвійних нових рядках
                               .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`) // Кожен абзац в <p>, одинарні \n в <br>
                               .join('');
          }
      }
      
      articleHTML += `
            <div class="article-content-main">
                ${contentHTML}
            </div>
            <a href="/html-page/newsPage" class="back-to-news">← Повернутися до новин</a>
        </article>`;
      
      articleContainer.innerHTML = articleHTML;
    })
    .catch((err) => {
      console.error("Помилка при відображенні статті:", err);
      articleContainer.innerHTML = `
        <div class="article-error">
            <h2>Помилка</h2>
            <p>Сталася помилка під час завантаження новини: ${err.message}</p>
            <a href="/html-page/newsPage" class="back-to-news">← Повернутися до новин</a>
        </div>`;
      if(pageTitle) pageTitle.textContent = "Помилка завантаження | Кафедра ПЗАС";
    });
});

// Функція для форматування дати (залишається такою ж)
function formatDate(dateStr) {
  if (!dateStr) return ''; // Повертаємо порожній рядок, якщо дата не вказана
  const months = [
    "січня", "лютого", "березня", "квітня", "травня", "червня",
    "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"
  ];
  const date = new Date(dateStr);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}