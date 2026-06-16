const root = document.documentElement;
const homeScroll = document.getElementById("homeScroll");

const typingText = document.getElementById("typingText");
const secondTypingText = document.getElementById("secondTypingText");
const thirdTypingText = document.getElementById("thirdTypingText");
const fourthTypingText = document.getElementById("fourthTypingText");

const firstText = "HELLO, I AM JANE.";
const secondText = "I SPEND MOST OF MY TIME TURNING IDEAS INTO VISUALS.";
const thirdText = "SOMETIMES THEY'RE BRANDS. SOMETIMES THEY'RE WEBSITES.";
const fourthText = "HERE'S WHAT I'VE BEEN WORKING ON.";

const pageCount = 4;

let currentPage = 0;
let currentProgress = 0;
let isSnapping = false;
let touchStartY = 0;

let secondStarted = false;
let thirdStarted = false;
let fourthStarted = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeFloaty(x) {
  return 1 - Math.pow(1 - x, 3);
}

function setAnimationProgress(progress) {
  currentProgress = clamp(progress, 0, 1);

  const toSecond = clamp(currentProgress * 3, 0, 1);
  const toThird = clamp((currentProgress - 1 / 3) * 3, 0, 1);
  const toFourth = clamp((currentProgress - 2 / 3) * 3, 0, 1);

  root.style.setProperty("--scroll-progress", toSecond);
  root.style.setProperty("--to-second", toSecond);
  root.style.setProperty("--to-third", toThird);
  root.style.setProperty("--to-fourth", toFourth);

  if (toSecond > 0.72 && !secondStarted) {
    secondStarted = true;
    typeText(secondTypingText, secondText, { index: 0 }, 55);
  }

  if (toThird > 0.72 && !thirdStarted) {
    thirdStarted = true;
    typeText(thirdTypingText, thirdText, { index: 0 }, 55);
  }

  if (toFourth > 0.72 && !fourthStarted) {
    fourthStarted = true;
    typeText(fourthTypingText, fourthText, { index: 0 }, 55);
  }
}

function typeText(element, text, state, speed) {
  if (!element) return;

  if (state.index < text.length) {
    element.textContent += text.charAt(state.index);
    state.index += 1;
    setTimeout(() => typeText(element, text, state, speed), speed);
  } else {
    element.classList.add("done");
  }
}

function snapToPage(pageNumber) {
  const nextPage = clamp(pageNumber, 0, pageCount - 1);

  if (nextPage === currentPage || isSnapping) return;

  isSnapping = true;

  const startProgress = currentProgress;
  const endProgress = nextPage / (pageCount - 1);
  const startTime = performance.now();
  const duration = 1100;

  currentPage = nextPage;

  function animateSnap(now) {
    const elapsed = now - startTime;
    const rawProgress = clamp(elapsed / duration, 0, 1);
    const easedProgress = easeFloaty(rawProgress);
    const animatedProgress = startProgress + (endProgress - startProgress) * easedProgress;

    setAnimationProgress(animatedProgress);

    if (rawProgress < 1) {
      requestAnimationFrame(animateSnap);
    } else {
      setAnimationProgress(endProgress);
      window.scrollTo(0, currentPage * window.innerHeight);
      isSnapping = false;
    }
  }

  requestAnimationFrame(animateSnap);
}

function handleWheel(event) {
  event.preventDefault();

  if (isSnapping) return;

  if (event.deltaY > 0) {
    snapToPage(currentPage + 1);
  } else if (event.deltaY < 0) {
    snapToPage(currentPage - 1);
  }
}

function handleKeydown(event) {
  if (isSnapping) return;

  if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    snapToPage(currentPage + 1);
  }

  if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    snapToPage(currentPage - 1);
  }
}

function handleTouchStart(event) {
  touchStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
  if (isSnapping) return;

  const touchEndY = event.changedTouches[0].clientY;
  const difference = touchStartY - touchEndY;

  if (Math.abs(difference) < 40) return;

  if (difference > 0) {
    snapToPage(currentPage + 1);
  } else {
    snapToPage(currentPage - 1);
  }
}

window.addEventListener("load", () => {
  typeText(typingText, firstText, { index: 0 }, 90);
  setAnimationProgress(0);
});

window.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("keydown", handleKeydown);
window.addEventListener("touchstart", handleTouchStart, { passive: true });
window.addEventListener("touchend", handleTouchEnd, { passive: true });

window.addEventListener("resize", () => {
  window.scrollTo(0, currentPage * window.innerHeight);
  setAnimationProgress(currentPage / (pageCount - 1));
});