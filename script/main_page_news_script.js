
let news_container = document.querySelector(".news-container")// в блоці всі блоки з новинами
let count = 0
fetch("/news.json")
.then((ready) => ready.json())  
.then((json) => {
  json.forEach(element => {

    count++
    news_container.insertAdjacentHTML('afterbegin', 
        `<div class="news-card">
            <img src="/img-main-page/news/photo_news_${count}.png" alt="Перша новина">
            <h3 class="news_title">${element.headline}</h3>
            <p class="news_text">${element.news}</p>
        </div>`);
  });
})


