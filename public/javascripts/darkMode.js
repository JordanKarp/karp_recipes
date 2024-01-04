let darkMode = localStorage.getItem('darkMode')
const darkModeToggle = document.querySelector('#dark-mode-toggle')

const enableDarkMode = () => {
    document.body.classList.add('darkMode')
    darkModeToggle.innerHTML = 'Light Mode'

    localStorage.setItem('darkMode', 'enabled')
}
const disableDarkMode = () => {
    document.body.classList.remove('darkMode')
    darkModeToggle.innerHTML = 'Dark Mode'
    localStorage.setItem('darkMode', 'disabled')
}

if (darkMode == 'enabled') {
    enableDarkMode();
    darkModeToggle.innerHTML = 'Light Mode'
}

darkModeToggle.addEventListener('click', () => {
    darkMode = localStorage.getItem('darkMode')
    if (darkMode !== 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
})