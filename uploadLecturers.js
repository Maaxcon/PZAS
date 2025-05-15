const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Завантаження Service Account Key
const serviceAccount = require("./serviceAccountKey.json");

// Ініціалізація Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id || "pzas-db483",
  storageBucket: "pzas-db483.firebasestorage.app",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function uploadLecturers() {
  let lecturers;
  try {
    // Читаємо вміст lecturers.json — він має містити чистий JSON!
    lecturers = JSON.parse(fs.readFileSync("lecturers.json", "utf8"));
  } catch (error) {
    console.error("Не вдалося зчитати lecturers.json:", error);
    return;
  }

  const results = [];
  console.log(`🔥 Використовується бакет: ${bucket.name}`);
  console.log("📡 Підключення до Firestore встановлено.");

  for (const lecturer of lecturers) {
    // Шлях до фото у папці "photos"
    const localPhotoPath = path.join(__dirname, "photos", lecturer.photo);
    const storagePath = `lecturers/${lecturer.photo}`;

    // Завантаження фото в Firebase Storage
    try {
      await bucket.upload(localPhotoPath, {
        destination: storagePath,
        metadata: { contentType: "image/jpeg" },
      });
      console.log(`📷 Фото завантажено: ${lecturer.photo}`);
    } catch (error) {
      console.error(`⚠️ Не вдалося завантажити фото ${lecturer.photo}: ${error.message}`);
      results.push({
        name: lecturer.name,
        status: "error",
        message: `Фото: ${error.message}`,
      });
      continue;
    }

    // Підготовка даних для Firestore
    const data = {
       name: lecturer.name,
       role: lecturer.role,
       specialization: lecturer.specialization,
       email: lecturer.email || "",
       biography: lecturer.biography || "",
       interests: lecturer.interests || [],
       publications: lecturer.publications || [],
       profiles: lecturer.profiles || {},
       photo: storagePath

    };

    // Додавання даних до колекції "lecturers" (документ створюється автоматично)
    try {
      const docRef = await db.collection("lecturers").add(data);
      console.log(`✅ Викладача додано: ${lecturer.name}, ID: ${docRef.id}`);
      results.push({ name: lecturer.name, status: "ok", id: docRef.id });
    } catch (error) {
      console.error(`❌ Не вдалося додати документ для ${lecturer.name}:`, error);
      results.push({
        name: lecturer.name,
        status: "error",
        message: `Firestore: ${error.message}`,
      });
    }
  }

  console.log("🎉 Завантаження завершено!");
  console.table(results);
}

uploadLecturers().catch((err) => console.error("Помилка виконання:", err));