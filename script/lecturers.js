import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

// 🔹 Налаштування Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA1VzQcRCzVz86u6GY0yyODa64H-Z6mAJk",
  authDomain: "pzas-db483.firebaseapp.com",
  databaseURL: "https://pzas-db483-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pzas-db483",
  storageBucket: "pzas-db483.appspot.com",
  messagingSenderId: "412709406680",
  appId: "1:412709406680:web:50cb541efb79f2b15d54ad"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 🔹 Отримання URL зображення з Firebase Storage
async function getTeacherPhoto(photoPath) {
    try {
        const photoRef = ref(storage, photoPath);
        return await getDownloadURL(photoRef);
    } catch (error) {
        console.error("🚨 Помилка завантаження фото:", error);
        return "/img/default-placeholder.png"; // Якщо фото недоступне, ставимо заглушку
    }
}

// 🔹 Функція отримання даних викладачів
async function loadTeachers() {
    const querySnapshot = await getDocs(collection(db, "lecturers"));
    const teachers = [];

    querySnapshot.forEach(doc => {
        teachers.push({ id: doc.id, ...doc.data() });
    });

    displayTeachers(teachers);
}

// 🔹 Відображення викладачів
async function displayTeachers(teachers) {
    const teachersList = document.getElementById("teachersList");
    teachersList.innerHTML = "";

    for (const teacher of teachers) {
        const imageUrl = await getTeacherPhoto(`lecturers/${teacher.photo}`);

        const card = document.createElement("div");
        card.className = "teacher-card";
        card.innerHTML = `
            <div class="teacher-photo">
                <img src="${imageUrl}" alt="${teacher.name}">
            </div>
            <div class="teacher-info">
                <h4 class="teacher-name">${teacher.name}</h4>
                <p class="teacher-position">${teacher.role}</p>
                <p class="teacher-specialty">${teacher.specialization}</p>
                <a href="#" class="teacher-details" data-id="${teacher.id}">Детальніше</a>
            </div>
        `;
        teachersList.appendChild(card);
    }
}

// 🔹 Відображення деталей викладача
document.addEventListener("click", async function (event) {
    if (event.target.classList.contains("teacher-details")) {
        const teacherId = event.target.getAttribute("data-id");
        showTeacherDetails(teacherId);
    }
});

async function showTeacherDetails(id) {
    const docRef = await getDocs(collection(db, "lecturers"));
    let teacherData = null;

    docRef.forEach(doc => {
        if (doc.id === id) {
            teacherData = doc.data();
        }
    });

    if (teacherData) {
        const imageUrl = await getTeacherPhoto(`lecturers/${teacherData.photo}`);

        document.querySelector(".section-content").innerHTML = `
            <div class="teacher-details-page">
                <h2>${teacherData.name}</h2>
                <img src="${imageUrl}" alt="${teacherData.name}">
                <p><strong>Посада:</strong> ${teacherData.role}</p>
                <p><strong>Спеціалізація:</strong> ${teacherData.specialization}</p>
                <p><strong>Біографія:</strong> ${teacherData.biography}</p>
                <p><strong>Наукові інтереси:</strong> ${teacherData.interests.join(", ")}</p>
                <a href="#" id="backToList">Назад до списку</a>
            </div>
        `;

        // 🔹 Додаємо обробник кліка для кнопки "Назад до списку"
        document.getElementById("backToList").addEventListener("click", function (e) {
            e.preventDefault();
            loadTeachers();
        });
    }
}

// 🔹 Запуск завантаження викладачів
loadTeachers();