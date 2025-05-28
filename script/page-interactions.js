    // script/page-interactions.js
    document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-container .nav');

    function changeNav() {
        let index = sections.length;

        // Проходимо по секціях знизу вгору, щоб знайти видиму
        // window.scrollY + 100 - поточна прокрутка + невеликий буфер зверху,
        // щоб посилання ставало активним трохи раніше, ніж секція досягне самого верху екрану.
        while(--index >= 0 && window.scrollY + 100 < sections[index].offsetTop) {}

        navLinks.forEach((link) => link.classList.remove('active'));

        // Якщо ми знайшли секцію (index >= 0) і є відповідне посилання
        if (index >= 0 && sections[index]) {
            let activeLink = document.querySelector(`.nav-container .nav[href="#${sections[index].id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        } else if (window.scrollY < (sections[0] ? sections[0].offsetTop : window.innerHeight / 2)) {
            // Якщо ми вище першої секції (або якщо секцій немає, але ми вгорі), активуємо "Головна"
            // Це також спрацює, якщо video-hero не має свого id, але є першим блоком
            let homeLink = document.querySelector('.nav-container .nav[href="#video-hero"]');
            if (homeLink) {
               homeLink.classList.add('active');
            }
        }
    }

    // Активувати правильне посилання при завантаженні
    if (window.scrollY < (sections[0] ? sections[0].offsetTop - 100 : window.innerHeight / 2) ) {
         navLinks.forEach((link) => link.classList.remove('active'));
         let homeLink = document.querySelector('.nav-container .nav[href="#video-hero"]');
         if (homeLink) {
             homeLink.classList.add('active');
         }
    } else {
        changeNav(); // Викликати для встановлення активного стану при завантаженні, якщо не на самому верху
    }

    window.addEventListener('scroll', changeNav);

    // Плавна прокрутка для якірних посилань
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            // Перевірка, чи це не просто "#" (посилання-заглушка)
            if (targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Враховуємо висоту фіксованого хедера, якщо він є
                    const header = document.querySelector('.header.sticky'); // Припускаємо, що фіксований хедер має клас sticky
                    const headerHeight = header ? header.offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});