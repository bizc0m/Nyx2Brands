function createStars() {
  const starsContainer = document.getElementById('stars');
  const count = 150;

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';

    const x = Math.random() * 100;
    const y = Math.random() * 100;

    star.style.left = `${x}%`;
    star.style.top = `${y}%`;

    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    star.style.animationDelay = `${Math.random() * 2}s`;

    starsContainer.appendChild(star);
  }
}

window.onload = function() {
  createStars();
};