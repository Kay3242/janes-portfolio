function initCarousel(carouselId, interval = 4000, linkedTextId = null) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const prevButton = carousel.querySelector(".carousel-prev");
  const nextButton = carousel.querySelector(".carousel-next");
  const dotsWrap = carousel.querySelector(".carousel-dots");

  const linkedText = linkedTextId ? document.getElementById(linkedTextId) : null;
  const textSlides = linkedText
    ? [...linkedText.querySelectorAll(".guidelines-copy-slide")]
    : [];

  if (!slides.length || !dotsWrap) return;

  let currentSlide = 0;
  let autoplayTimer;

  function renderCarousel() {
    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === currentSlide);
    });

    [...dotsWrap.children].forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });

    textSlides.forEach((textSlide, index) => {
      textSlide.classList.toggle("active", index === currentSlide);
    });
  }

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    renderCarousel();
  }

  function goToNextSlide() {
    goToSlide(currentSlide + 1);
  }

  function restartAutoplay() {
    clearInterval(autoplayTimer);

    if (slides.length > 1) {
      autoplayTimer = setInterval(goToNextSlide, interval);
    }
  }

  dotsWrap.innerHTML = "";

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);

    dot.addEventListener("click", () => {
      goToSlide(index);
      restartAutoplay();
    });

    dotsWrap.appendChild(dot);
  });

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      goToSlide(currentSlide - 1);
      restartAutoplay();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      goToNextSlide();
      restartAutoplay();
    });
  }

  renderCarousel();
  restartAutoplay();
}

document.addEventListener("DOMContentLoaded", () => {
  initCarousel("pauseClubCarousel", 4000);
  initCarousel("guidelinesCarousel", 4000, "guidelinesText");
});

document.addEventListener("DOMContentLoaded", () => {
  const circles = [...document.querySelectorAll(".floating-circles .circle")];

  if (!circles.length) return;

  function moveCircles() {
    const scrollY = window.scrollY;

    circles.forEach((circle, index) => {
      const speed = -0.08 - index * 0.02;
      circle.style.setProperty("--circle-scroll", `${scrollY * speed}px`);
    });
  }

  moveCircles();
  window.addEventListener("scroll", moveCircles, { passive: true });
});