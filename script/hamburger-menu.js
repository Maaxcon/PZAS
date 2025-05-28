document.addEventListener('DOMContentLoaded', () => {
    console.log('Hamburger script loaded and DOM ready.');

    // Батьківський елемент, який точно існує на момент завантаження скрипта
    // Якщо <header class="header"> завантажується динамічно, використовуйте document
    const headerElement = document.querySelector('.header'); // Або document

    if (!headerElement) {
        console.error('CRITICAL: Parent element for event delegation (.header or document) not found.');
        return;
    }

    headerElement.addEventListener('click', (event) => {
        // Перевіряємо, чи є клікнутий елемент (або його батько) кнопкою гамбургера
        const hamburgerButton = event.target.closest('.hamburger-menu');

        if (hamburgerButton) {
            console.log('Hamburger button clicked (via delegation)!');
            
            const navList = document.querySelector('.nav-container .list'); // Шукаємо список при кожному кліку
                                        // або один раз, якщо .nav-container статичний

            if (navList) {
                const isOpened = hamburgerButton.getAttribute('aria-expanded') === 'true';
                hamburgerButton.setAttribute('aria-expanded', String(!isOpened));
                navList.classList.toggle('active');
                console.log('Nav list classes after toggle:', navList.className);
            } else {
                console.error('CRITICAL: Navigation list (.nav-container .list) not found when hamburger was clicked!');
            }
        }
    });

    // Перевірка, чи кнопка і список є на момент DOMContentLoaded (для діагностики)
    // Цей блок тепер більше для інформації, основна логіка в делегуванні
    const initialHamburgerButton = document.querySelector('.hamburger-menu');
    const initialNavList = document.querySelector('.nav-container .list');
    console.log('Initial check - Hamburger Button element:', initialHamburgerButton);
    console.log('Initial check - Nav List element:', initialNavList);
    if (!initialHamburgerButton) {
         console.warn('WARN: Hamburger button not present at DOMContentLoaded (expected if loaded dynamically).');
    }

});