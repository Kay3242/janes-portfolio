const root = document.documentElement;
const homeScroll = document.getElementById("homeScroll");

const typingText = document.getElementById("typingText");
const secondTypingText = document.getElementById("secondTypingText");
const thirdTypingText = document.getElementById("thirdTypingText");
const fourthTypingText = document.getElementById("fourthTypingText");
const exploreTypingText = document.getElementById("exploreTypingText");

const exploreButton = document.querySelector(".explore-button");
const exploreOverlay = document.getElementById("exploreOverlay");
const tagForm = document.getElementById("tagForm");

const selectedTags = document.getElementById("selectedTags");
const tagOptions = document.getElementById("tagOptions");
const tagInput = document.getElementById("tagInput");

const firstText = "HELLO, I AM JANE.";
const secondText = "I SPEND MOST OF MY TIME TURNING IDEAS INTO VISUALS.";
const thirdText = "SOMETIMES THEY'RE BRANDS. SOMETIMES THEY'RE WEBSITES.";
const fourthText = "HERE'S WHAT I'VE BEEN WORKING ON.";
const exploreText = "WHAT ARE YOU LOOKING FOR?";

const pageCount = 4;

const overlayBackButton = document.getElementById("overlayBackButton");

const continueButton = document.querySelector(".continue-button");
const loadingPage = document.getElementById("loadingPage");

let currentPage = 0;
let currentProgress = 0;
let isSnapping = false;
let touchStartY = 0;

let secondStarted = false;
let thirdStarted = false;
let fourthStarted = false;
let exploreStarted = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeFloaty(x) {
  return 1 - Math.pow(1 - x, 3);
}

function typeText(element, text, state, speed, onComplete) {
  if (!element) return;

  if (state.index < text.length) {
    element.textContent += text.charAt(state.index);
    state.index += 1;
    setTimeout(() => typeText(element, text, state, speed, onComplete), speed);
  } else {
    element.classList.add("done");
    if (onComplete) onComplete();
  }
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
  if (exploreOverlay.classList.contains("is-open")) return;

  event.preventDefault();

  if (isSnapping) return;

  if (event.deltaY > 0) {
    snapToPage(currentPage + 1);
  } else if (event.deltaY < 0) {
    snapToPage(currentPage - 1);
  }
}

function handleKeydown(event) {
  if (exploreOverlay.classList.contains("is-open")) return;
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
  if (exploreOverlay.classList.contains("is-open")) return;
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

function openExploreOverlay(event) {
  event.preventDefault();

  exploreOverlay.classList.add("is-open");

  if (exploreStarted) return;

  exploreStarted = true;

  setTimeout(() => {
    typeText(exploreTypingText, exploreText, { index: 0 }, 60, () => {
      tagForm.classList.add("is-visible");
    });
  }, 500);
}

function createSelectedTag(label, sourceButton) {
  const tag = document.createElement("span");
  tag.className = "selected-tag";
  tag.textContent = label;
  tag.style.visibility = "hidden";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-tag";
  removeButton.setAttribute("aria-label", `Remove ${label}`);
  removeButton.textContent = "×";

  removeButton.addEventListener("click", () => {
    animateTagBackToOptions(tag, sourceButton, label);
  });

  tag.appendChild(removeButton);
  selectedTags.insertBefore(tag, tagInput);

  return tag;
}

function animateRemainingTags(beforeRects) {
  const buttons = [...tagOptions.querySelectorAll("button:not([hidden])")];

  buttons.forEach((button) => {
    const before = beforeRects.get(button);
    const after = button.getBoundingClientRect();

    if (!before) return;

    const deltaX = before.left - after.left;
    const deltaY = before.top - after.top;

    button.animate(
      [
        { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
        { transform: "translate3d(0, 0, 0)" }
      ],
      {
        duration: 520,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    );
  });
}

function makeFlyingTag(label, rect) {
  const flyingTag = document.createElement("span");
  flyingTag.className = "flying-tag";
  flyingTag.textContent = label;
  flyingTag.style.left = `${rect.left}px`;
  flyingTag.style.top = `${rect.top}px`;
  flyingTag.style.width = `${rect.width}px`;
  flyingTag.style.height = `${rect.height}px`;

  document.body.appendChild(flyingTag);

  return flyingTag;
}

function animateTagToBar(button) {
  const label = button.textContent.trim();
  const startRect = button.getBoundingClientRect();

  const beforeRects = new Map();
  tagOptions.querySelectorAll("button:not([hidden])").forEach((option) => {
    beforeRects.set(option, option.getBoundingClientRect());
  });

  const selectedTag = createSelectedTag(label, button);
  const endRect = selectedTag.getBoundingClientRect();

  const flyingTag = makeFlyingTag(label, startRect);

  button.hidden = true;
  animateRemainingTags(beforeRects);

  const moveX = endRect.left - startRect.left;
  const moveY = endRect.top - startRect.top;
  const scaleX = endRect.width / startRect.width;
  const scaleY = endRect.height / startRect.height;

  flyingTag.animate(
    [
      { transform: "translate3d(0, 0, 0) scale(1, 1)" },
      { transform: `translate3d(${moveX}px, ${moveY}px, 0) scale(${scaleX}, ${scaleY})` }
    ],
    {
      duration: 700,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards"
    }
  ).onfinish = () => {
    selectedTag.style.visibility = "visible";
    flyingTag.remove();
  };
}

function animateTagBackToOptions(tag, sourceButton, label) {
  const startRect = tag.getBoundingClientRect();

  const beforeRects = new Map();
  tagOptions.querySelectorAll("button:not([hidden])").forEach((option) => {
    beforeRects.set(option, option.getBoundingClientRect());
  });

  sourceButton.hidden = false;
  sourceButton.style.visibility = "hidden";

  const endRect = sourceButton.getBoundingClientRect();

  const flyingTag = makeFlyingTag(label, startRect);

  tag.remove();
  animateRemainingTags(beforeRects);

  const moveX = endRect.left - startRect.left;
  const moveY = endRect.top - startRect.top;
  const scaleX = endRect.width / startRect.width;
  const scaleY = endRect.height / startRect.height;

  flyingTag.animate(
    [
      { transform: "translate3d(0, 0, 0) scale(1, 1)" },
      { transform: `translate3d(${moveX}px, ${moveY}px, 0) scale(${scaleX}, ${scaleY})` }
    ],
    {
      duration: 700,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards"
    }
  ).onfinish = () => {
    flyingTag.remove();
    sourceButton.style.visibility = "visible";
  };
}

function closeExploreOverlay() {
  exploreOverlay.classList.remove("is-open");
  snapToPage(3);
}

function openLoadingPage() {
  exploreOverlay.classList.remove("is-open");
  loadingPage.classList.add("is-open");
}

window.addEventListener("load", () => {
  typeText(typingText, firstText, { index: 0 }, 90);
  setAnimationProgress(0);
});

exploreButton.addEventListener("click", openExploreOverlay);

tagOptions.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button || button.hidden || button.style.visibility === "hidden") return;

  animateTagToBar(button);
});

window.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("keydown", handleKeydown);
window.addEventListener("touchstart", handleTouchStart, { passive: true });
window.addEventListener("touchend", handleTouchEnd, { passive: true });

window.addEventListener("resize", () => {
  window.scrollTo(0, currentPage * window.innerHeight);
  setAnimationProgress(currentPage / (pageCount - 1));
});

overlayBackButton.addEventListener("click", closeExploreOverlay);
continueButton.addEventListener("click", openLoadingPage);