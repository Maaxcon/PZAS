import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

// 🔹 Налаштування Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA1VzQcRCzVz86u6GY0yyODa64H-Z6mAJk",
  authDomain: "pzas-db483.firebaseapp.com",
  databaseURL: "https://pzas-db483-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pzas-db483",
  storageBucket: "pzas-db483.firebasestorage.app", // ✅ ПРАВИЛЬНО
  messagingSenderId: "412709406680",
  appId: "1:412709406680:web:50cb541efb79f2b15d54ad"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 🔹 Отримання правильного URL для фото
async function getTeacherPhoto(photoPath) {
    try {
        const photoRef = ref(storage, `lecturers/${photoPath}`);
        return await getDownloadURL(photoRef);
    } catch (error) {
        console.error("🚨 Помилка завантаження фото:", error);
        return "/img/default-placeholder.png";
    }
}

let allTeachers = []; // Зберігаємо всіх викладачів для фільтрації

// Завантаження викладачів з Firestore
async function loadTeachers() {
    try {
        const querySnapshot = await getDocs(collection(db, "lecturers"));
        allTeachers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        displayTeachers(allTeachers);
    } catch (error) {
        console.error("🚨 Помилка завантаження викладачів:", error);
    }
}

// Фільтрація та відображення
function filterTeachers(role) {
    if (role === "all") {
        displayTeachers(allTeachers);
    } else {
        const filtered = allTeachers.filter(t => t.role && t.role.toLowerCase().includes(role.toLowerCase()));
        displayTeachers(filtered);
    }
}

// 🔹 Відображення викладачів
async function displayTeachers(teachers) {
    const teachersList = document.getElementById("teachersList");
    if (!teachersList) {
        console.error("Елемент #teachersList не знайдено!");
        return;
    }

    // Анімація зникнення старих карток
    Array.from(teachersList.children).forEach(card => {
        card.classList.add("hide");
    });

    // Зачекай, поки стара анімація завершиться
    await new Promise(res => setTimeout(res, 300));

    teachersList.innerHTML = "";

    const photoUrls = await Promise.all(
        teachers.map(teacher => getTeacherPhoto(teacher.photo))
    );

    teachers.forEach((teacher, idx) => {
        const imageUrl = photoUrls[idx];
        const card = document.createElement("div");
        card.className = "teacher-card hide";
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
        // Плавна поява
        setTimeout(() => card.classList.remove("hide"), 10);
    });
}

// 🔹 Відображення деталей викладача
document.addEventListener("click", async function (event) {
    if (event.target.classList.contains("teacher-details")) {
        const teacherId = event.target.getAttribute("data-id");
        showTeacherDetails(teacherId);
    }
});

async function showTeacherDetails(id) {
    try {
        const querySnapshot = await getDocs(collection(db, "lecturers"));
        const teacherData = querySnapshot.docs.find(doc => doc.id === id)?.data();

        if (teacherData) {
            const imageUrl = await getTeacherPhoto(teacherData.photo);
            const sectionContent = document.querySelector(".section-content");
            sectionContent.innerHTML = `
                <div class="teacher-details-page">
                    <div class="photo-and-basic-info">
                        <img src="${imageUrl}" alt="${teacherData.name}">
                        
                        <div class="basic-info-block">
                            <div><strong>Посада:</strong> ${teacherData.role}</div>
                            <div><strong>Спеціалізація:</strong> ${teacherData.specialization}</div>
                            <div><strong>Електронна пошта:</strong> ${teacherData.email || "Не вказано"}</div>
                        </div>
                    </div>

                    <div class="details">
                        <h2>${teacherData.name}</h2>
                        <div class="info-block"><strong>Біографія:</strong> ${teacherData.biography}</div>
                        <div class="info-block"><strong>Наукові інтереси:</strong> ${teacherData.interests.join(", ")}</div>

                        ${(teacherData.profiles.google_scholar || teacherData.profiles.scopus || teacherData.profiles.orcid || teacherData.profiles.researchgate || teacherData.profiles.linkedin || teacherData.profiles.publons || teacherData.profiles.web_of_science) ? `
                            <div class="info-block">
                                <strong>Наукові профілі:</strong><br>
                                ${teacherData.profiles.google_scholar ? `<a href="${teacherData.profiles.google_scholar}" target="_blank">Google Scholar</a><br>` : ''}
                                ${teacherData.profiles.scopus ? `<a href="${teacherData.profiles.scopus}" target="_blank">Scopus</a><br>` : ''}
                                ${teacherData.profiles.orcid ? `<a href="${teacherData.profiles.orcid}" target="_blank">ORCID</a><br>` : ''}
                                ${teacherData.profiles.researchgate ? `<a href="${teacherData.profiles.researchgate}" target="_blank">ResearchGate</a><br>` : ''}
                                ${teacherData.profiles.linkedin ? `<a href="${teacherData.profiles.linkedin}" target="_blank">LinkedIn</a><br>` : ''}
                                ${teacherData.profiles.publons ? `<a href="${teacherData.profiles.publons}" target="_blank">Publons</a><br>` : ''}
                                ${teacherData.profiles.web_of_science ? `<a href="${teacherData.profiles.web_of_science}" target="_blank">Web of Science</a><br>` : ''}
                            </div>
                        ` : ''}
                        <a href="#" id="backToList" class="button-link">Назад до списку</a>
                    </div>
                </div>


            `;
        // ${teacherData.profiles.google_scholar ? `<div class="info-block"><strong>Google Scholar:</strong> <a href="${teacherData.profiles.google_scholar}" target="_blank">${teacherData.profiles.google_scholar}</a></div>` : ''}
        // ${teacherData.profiles.scopus ? `<div class="info-block"><strong>Scopus:</strong> <a href="${teacherData.profiles.scopus}" target="_blank">${teacherData.profiles.scopus}</a></div>` : ''}
        // ${teacherData.profiles.orcid ? `<div class="info-block"><strong>ORCID:</strong> <a href="${teacherData.profiles.orcid}" target="_blank">${teacherData.profiles.orcid}</a></div>` : ''}
        // ${teacherData.profiles.researchgate ? `<div class="info-block"><strong>ResearchGate:</strong> <a href="${teacherData.profiles.researchgate}" target="_blank">${teacherData.profiles.researchgate}</a></div>` : ''}
        // ${teacherData.profiles.linkedin ? `<div class="info-block"><strong>LinkedIn:</strong> <a href="${teacherData.profiles.linkedin}" target="_blank">${teacherData.profiles.linkedin}</a></div>` : ''}
        // ${teacherData.profiles.publons ? `<div class="info-block"><strong>Publons:</strong> <a href="${teacherData.profiles.publons}" target="_blank">${teacherData.profiles.publons}</a></div>` : ''}
        // ${teacherData.profiles.web_of_science ? `<div class="info-block"><strong>Web of Science:</strong> <a href="${teacherData.profiles.web_of_science}" target="_blank">${teacherData.profiles.web_of_science}</a></div>` : ''}

            document.getElementById("backToList").addEventListener("click", function (e) {
                e.preventDefault();
                // Відновлюємо структуру списку викладачів
                sectionContent.innerHTML = `
                    <div class="teachers-section">
                        <div class="teachers-grid" id="teachersList">
                            <!-- Динамічне завантаження карток викладачів -->
                        </div>
                    </div>
                `;
                loadTeachers();
            });
        }
    } catch (error) {
        console.error("🚨 Помилка завантаження деталей викладача:", error);
    }
}

// Обробник кліків по вкладках
document.addEventListener("DOMContentLoaded", () => {
    loadTeachers();

    const tabs = document.querySelectorAll("#roleFilter a");
    tabs.forEach(tab => {
        tab.addEventListener("click", function (e) {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            const role = this.getAttribute("data-role");
            filterTeachers(role);
        });
    });
});