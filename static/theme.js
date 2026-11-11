//set dark mode on page load based on local storage
document.addEventListener('DOMContentLoaded', () => {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const themeButton = document.querySelector('button[name="darkMode"][value="theme"]');
        themeButton.textContent = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        const themeButton = document.querySelector('button[name="darkMode"][value="theme"]');
        themeButton.textContent = '🌙';
    }
});

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('darkMode', newTheme === 'dark');
    const themeButton = document.querySelector('button[name="darkMode"][value="theme"]');
    themeButton.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}