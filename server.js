const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

// 🔐 Завантаження змінних середовища
dotenv.config();

// 🔥 Firebase: Ініціалізація
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pzas-db483-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "pzas-db483.firebasestorage.app",
});

const db = admin.firestore(); // Firestore
const bucket = admin.storage().bucket(); // Firebase Storage

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 Безпека (helmet - його CSP буде перезаписано нижче, але інші його функції залишаться)
app.use(
  helmet({
    contentSecurityPolicy: { // Ця конфігурація CSP від helmet буде перезаписана наступним middleware
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://maps.googleapis.com",
          "https://www.gstatic.com",
          "https://www.googleapis.com",
        ],
        connectSrc: [
          "'self'",
          "https://firestore.googleapis.com",
          "https://www.googleapis.com",
          "https://firebasestorage.googleapis.com",
        ],
        styleSrc: ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
        // frameSrc тут не визначено, тому береться з defaultSrc або блокується
      },
    },
  })
);

// 🌐 CORS (дозволяє Firebase Storage)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// 🛡️ Додатковий Content-Security-Policy (ЦЕЙ БЛОК ПОТРІБНО ОНОВИТИ)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' https://maps.googleapis.com https://www.gstatic.com https://www.googleapis.com; " +
    // ОНОВЛЕНО style-src: додано https://fonts.googleapis.com
    "style-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline' https://fonts.googleapis.com; " +
    // ОНОВЛЕНО font-src: додано https://fonts.gstatic.com (cdnjs тут, можливо, не потрібен для шрифтів)
    "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; " +
    // ОНОВЛЕНО frame-src: додано https://www.youtube.com
    "frame-src 'self' https://www.google.com https://www.youtube.com; " +
    "connect-src 'self' https://firestore.googleapis.com https://www.googleapis.com https://firebasestorage.googleapis.com; " +
    "img-src 'self' https://firebasestorage.googleapis.com https://cdn.jsdelivr.net data:;" // Видалено дублікат https://firebasestorage.googleapis.com
  );
  next();
});

// 📦 Парсери
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📝 Логування
app.use(morgan("combined"));

// 🗂️ Статичні файли
app.use(express.static(path.join(__dirname, "html-page")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img-main-page", express.static(path.join(__dirname, "img-main-page")));
app.use("/containsHF_HTML", express.static(path.join(__dirname, "containsHF_HTML")));
app.use("/script", express.static(path.join(__dirname, "script")));
app.use("/video", express.static(path.join(__dirname, "video"))); // Якщо у вас є локальні відео

// ... (решта вашого коду server.js залишається без змін) ...

// 📄 Маршрути
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html-page", "index.html"));
});

app.get("/html-page/lecturs", (req, res) => {
  res.sendFile(path.join(__dirname, "html-page", "lecturs.html"));
});

app.get("/html-page/scholarship", (req, res) => {
  res.sendFile(path.join(__dirname, "html-page", "scholarship.html"));
});

app.get("/html-page/121", (req, res) => {
  res.sendFile(path.join(__dirname, "html-page", "121.html"));
});

app.get("/html-page/newsPage", (req, res) => {
  res.sendFile(path.join(__dirname, "html-page", "newsPage.html"));
});

app.get("/html-page/newsPage/article/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "html-page", "newsArticle.html"));
});


// ✅ Шляхи до header/footer
app.get("/header.html", (req, res) => {
  res.sendFile(path.join(__dirname, "containsHF_HTML", "header.html"));
});

app.get("/footer.html", (req, res) => {
  res.sendFile(path.join(__dirname, "containsHF_HTML", "footer.html"));
});

// 📰 JSON з новинами
app.get("/news.json", (req, res) => {
  res.sendFile(path.join(__dirname, "news.json"));
});

app.get("/newsPage.json", (req, res) => {
  res.sendFile(path.join(__dirname, "newsPage.json"));
});

// 🔥 Firebase: додавання користувача
app.post("/add-user", async (req, res) => {
  try {
    const { name, age } = req.body;
    await db.collection("users").add({ name, age });
    res.status(201).json({ message: "Користувача додано!" });
  } catch (error) {
    console.error("Помилка при додаванні користувача:", error);
    res.status(500).json({ error: "Помилка при додаванні користувача" });
  }
});

// 🔥 Завантаження викладачів з JSON (фото вже в Storage)
app.post("/api/upload-lecturers", async (req, res) => {
  const lecturers = req.body;

  if (!Array.isArray(lecturers)) {
    return res.status(400).json({ error: "Очікується масив викладачів" });
  }

  const results = [];

  for (const lecturer of lecturers) {
    try {
      await db.collection("lecturers").add({
        name: lecturer.name,
        role: lecturer.role,
        specialization: lecturer.specialization,
        email: lecturer.email || "",
        description: lecturer.description || "",
        interests: lecturer.interests || [],
        profiles: lecturer.profiles || {},
        photo: lecturer.photo, // має вигляд "lecturers/oleksiuk.jpg"
      });

      results.push({ name: lecturer.name, status: "ok" });
    } catch (err) {
      console.error(`❌ Помилка для ${lecturer.name}:`, err.message);
      results.push({ name: lecturer.name, status: "error", message: err.message });
    }
  }

  res.json({ message: "Готово", results });
});

// ❌ Сторінка 404
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "html-page", "404.html"));
});

// 💥 Обробка помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Сталася внутрішня помилка сервера",
    status: 500,
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 🚀 Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`✅ Сервер працює на http://localhost:${PORT}`);
});

// 🛑 Завершення
process.on("SIGTERM", () => {
  console.log("SIGTERM отримано. Завершення роботи...");
  server.close(() => {
    console.log("Сервер зупинено");
    process.exit(0);
  });
});

module.exports = app;