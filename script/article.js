// /script/newsArticle.js

document.addEventListener("DOMContentLoaded", () => {
  const articleContainer = document.getElementById("article-container");

  // Отримати id статті з URL, наприклад /newsPage.html?id=3
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id");

  if (!articleId) {
    articleContainer.innerHTML = "<p>Новина не знайдена. Немає вказаного ID.</p>";
    return;
  }

  fetch("/newsPage.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Помилка завантаження новин");
      }
      return response.json();
    })
    .then((data) => {
      // Шукаємо статтю з потрібним id
      const allNews = [data.featuredNews, ...data.latestNews];
      const article = allNews.find((item) => item.id === Number(articleId));

      if (!article) {
        articleContainer.innerHTML = "<p>Новина не знайдена.</p>";
        return;
      }

      // Відобразити статтю
      articleContainer.innerHTML = `
        <h1 class="article-title">${article.title}</h1>
        <div class="article-date">${formatDate(article.date)}</div>
        ${article.image ? `<img src="${article.image}" alt="${article.title}" class="article-image">` : ""}
        <div class="article-content">${article.content}</div>
      `;
    })
    .catch((err) => {
      articleContainer.innerHTML = `<p>Сталася помилка: ${err.message}</p>`;
    });
});

// Функція для форматування дати
function formatDate(dateStr) {
  const months = [
    "січня", "лютого", "березня", "квітня", "травня", "червня",
    "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"
  ];
  const date = new Date(dateStr);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
