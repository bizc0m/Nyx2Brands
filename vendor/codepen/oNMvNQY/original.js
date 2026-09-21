document
  .querySelector(".app")
  .querySelector(".app-header")
  .querySelector(".slider-toggle-wrapper")
  .addEventListener("click", (evt) => {
    const toggle = document.querySelector(".slider-toggle");
    if (toggle.classList.contains("is-selected")) {
      toggle.classList.remove("is-selected");
      document.body.classList.add("light-mode");
    } else {
      toggle.classList.add("is-selected");
      document.body.classList.remove("light-mode");
    }
  });
