let darkMode = localStorage.getItem('darkMode')
const darkModeToggle = document.querySelector('#dark-mode-toggle')

const enableDarkMode = () => {
    document.body.classList.add('darkMode')
    localStorage.setItem('darkMode', 'enabled')
}
const disableDarkMode = () => {
    document.body.classList.remove('darkMode')
    localStorage.setItem('darkMode', 'disabled')
}

if (darkMode == 'enabled') {
    enableDarkMode();
}

darkModeToggle.addEventListener('click', () => {
    console.log('test')
    // darkMode = localStorage.getItem('darkMode')
    // if (darkMode !== 'enabled') {
    //     enableDarkMode();
    // } else {
    //     disableDarkMode();
    // }
})