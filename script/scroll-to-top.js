document.addEventListener('DOMContentLoaded', function () {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    scrollToTopBtn.addEventListener('click', scrollToTop);

    function toggleScrollButton() {
        const scrolled = document.body.scrollTop > 300 || document.documentElement.scrollTop > 300;

        if (scrolled) {
            scrollToTopBtn.classList.add('visible');
            scrollToTopBtn.classList.remove('hidden');
        } else {
            scrollToTopBtn.classList.add('hidden');
            scrollToTopBtn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', toggleScrollButton);
    toggleScrollButton(); // Ініціалізація при завантаженні
});
