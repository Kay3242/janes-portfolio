document.querySelectorAll(".pc-carousel").forEach((carousel) => {
    const track = carousel.querySelector(".pc-carousel-track");
    const slides = [...carousel.querySelectorAll(".pc-slide")];
    const dots = [...carousel.querySelectorAll(".pc-carousel-dots a")];

    if (!track || slides.length < 2) return;

    let currentSlide = 0;
    let autoSlide;
    let scrollTimer;

    function updateDots() {
      dots.forEach((dot, index) => {
        const active = index === currentSlide;

        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
    }

    function showSlide(index) {
      currentSlide = (index + slides.length) % slides.length;

      track.scrollTo({
        left: slides[currentSlide].offsetLeft,
        behavior: "smooth"
      });

      updateDots();
    }

    function startAutoSlide() {
      clearInterval(autoSlide);

      autoSlide = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 4000);
    }

    carousel.querySelectorAll(".pc-arrow").forEach((arrow) => {
      arrow.addEventListener("click", (event) => {
        event.preventDefault();

        const target = carousel.querySelector(
          arrow.getAttribute("href")
        );

        const targetIndex = slides.indexOf(target);

        if (targetIndex !== -1) {
          showSlide(targetIndex);
          startAutoSlide();
        }
      });
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", (event) => {
        event.preventDefault();
        showSlide(index);
        startAutoSlide();
      });
    });

    track.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);

      scrollTimer = setTimeout(() => {
        const closestSlide = slides.reduce((closest, slide, index) => {
          const distance = Math.abs(
            track.scrollLeft - slide.offsetLeft
          );

          return distance < closest.distance
            ? { index, distance }
            : closest;
        }, {
          index: 0,
          distance: Infinity
        });

        currentSlide = closestSlide.index;
        updateDots();
      }, 100);
    });

    carousel.addEventListener("mouseenter", () => {
      clearInterval(autoSlide);
    });

    carousel.addEventListener("mouseleave", startAutoSlide);

    updateDots();
    startAutoSlide();
  });