let modeSwitch = document.querySelector(".mode-switch");
let main = document.querySelector(".main");
let darkMode = true;

modeSwitch.addEventListener("click", () => {
    if (darkMode) main.classList.add("dark");
    else main.classList.remove("dark");
    darkMode=!darkMode;
});
