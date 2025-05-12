const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Завантаження змінних середовища
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 Безпека
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://maps.googleapis.com"],
        frameSrc: ["'self'", "https://www.google.com"],
        styleSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        scriptSrcAttr: ["'self'"], // Дозволяє інлайн-скрипти
      },
    },
  })
);

// 🌐 CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 📦 Парсери
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📝 Логування
app.use(morgan('combined'));

// 🗂️ Статичні файли
app.use(express.static(path.join(__dirname, 'html-page'))); // HTML
app.use('/css', express.static(path.join(__dirname, 'css'))); // CSS
app.use('/img-main-page', express.static(path.join(__dirname, 'img-main-page'))); // Зображення
app.use('/containsHF_HTML', express.static(path.join(__dirname, 'containsHF_HTML'))); // Header/Footer
app.use('/script', express.static(path.join(__dirname, 'script'))); // JS

// 📄 Маршрути
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html-page', 'index.html'));
});

app.get('/html-page/lecturs', (req, res) => {
  res.sendFile(path.join(__dirname, 'html-page', 'lecturs.html'));
});

app.get('/html-page/scholarship', (req, res) => {
  res.sendFile(path.join(__dirname, 'html-page', 'scholarship.html'));
});

app.get('/html-page/121', (req, res) => {
  res.sendFile(path.join(__dirname, 'html-page', '121.html'));
});

// ✅ Зміни тут: нові правильні шляхи до header/footer
app.get('/header.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'containsHF_HTML', 'header.html'));
});

app.get('/footer.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'containsHF_HTML', 'footer.html'));
});

// ❌ Сторінка 404
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'html-page', '404.html'));
});

// 💥 Обробка помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Сталася внутрішня помилка сервера',
    status: 500,
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 🚀 Запуск
const server = app.listen(PORT, () => {
  console.log(`✅ Сервер працює на http://localhost:${PORT}`);
});

// 🛑 Завершення
process.on('SIGTERM', () => {
  console.log('SIGTERM отримано. Завершення роботи...');
  server.close(() => {
    console.log('Сервер зупинено');
    process.exit(0);
  });
});

module.exports = app;


