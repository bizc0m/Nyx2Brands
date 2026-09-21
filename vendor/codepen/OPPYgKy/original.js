// Add interactive functionality
document.addEventListener('DOMContentLoaded', function() {
  // Close alerts
  document.querySelectorAll('[id="feedback"] button').forEach(button => {
    button.addEventListener('click', function() {
      this.closest('.brutal-border').remove();
    });
  });

  // Toggle switch functionality
  document.querySelectorAll('[id="forms"] input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', function() {
      if (this.parentElement.classList.contains('relative')) {
        const knob = this.nextElementSibling.querySelector('span');
        knob.style.transform = this.checked ? 'translateX(100%)' : 'translateX(0)';
      }
    });
  });

  // Smooth scrolling for navigation
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
});