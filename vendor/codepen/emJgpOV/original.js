function showSection(sectionId) {
  document.querySelectorAll(".subpage, .hero").forEach((section) => {
    section.classList.remove("active");
    if (section.id === "home") {
      section.style.display = "none";
    } else {
      section.style.display = "none";
    }
  });

  const section = document.getElementById(sectionId);
  if (sectionId === "home") {
    section.style.display = "flex";
  } else {
    section.classList.add("active");
    section.style.display = "block";
  }

  const navMenu = document.getElementById("navMenu");
  if (navMenu.classList && navMenu.classList.contains("active")) {
    navMenu.classList.remove("active");
  }

  window.scrollTo(0, 0);
}

document.getElementById("mobileToggle").addEventListener("click", function () {
  const navMenu = document.getElementById("navMenu");
  navMenu.classList.toggle("active");
});

document.addEventListener("DOMContentLoaded", function () {
  showSection("home");

  const flickerElements = document.querySelectorAll(".flicker");
  flickerElements.forEach((el) => {
    setInterval(() => {
      if (Math.random() > 0.95) {
        el.style.opacity = 0.7;
        setTimeout(() => {
          el.style.opacity = 1;
        }, 100);
      }
    }, 2000);
  });
});
