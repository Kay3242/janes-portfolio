const root = document.documentElement;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeFloaty(x) {
  return 1 - Math.pow(1 - x, 3);
}

function typeText(element, text, speed, onComplete) {
  if (!element) return;

  element.textContent = "";
  element.classList.remove("done");

  let index = 0;

  function typeNextCharacter() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index += 1;
      setTimeout(typeNextCharacter, speed);
    } else {
      element.classList.add("done");
      if (onComplete) onComplete();
    }
  }

  typeNextCharacter();
}

/* HOME PAGE */

function initHomePage() {
  const homeScroll = document.getElementById("homeScroll");
  if (!homeScroll) return;

  const typingText = document.getElementById("typingText");
  const secondTypingText = document.getElementById("secondTypingText");
  const thirdTypingText = document.getElementById("thirdTypingText");
  const fourthTypingText = document.getElementById("fourthTypingText");
  const exploreTypingText = document.getElementById("exploreTypingText");

  const exploreButton = document.querySelector(".explore-button");
  const exploreOverlay = document.getElementById("exploreOverlay");
  const tagForm = document.getElementById("tagForm");
  const overlayBackButton = document.getElementById("overlayBackButton");
  const continueButton = document.querySelector(".continue-button");
  const loadingPage = document.getElementById("loadingPage");

  const selectedTags = document.getElementById("selectedTags");
  const tagOptions = document.getElementById("tagOptions");
  const tagInput = document.getElementById("tagInput");

  const firstText = "HELLO, I AM JANE.";
  const secondText = "I SPEND MOST OF MY TIME TURNING IDEAS INTO VISUALS.";
  const thirdText = "SOMETIMES THEY'RE BRANDS. SOMETIMES THEY'RE WEBSITES.";
  const fourthText = "HERE'S WHAT I'VE BEEN WORKING ON.";
  const exploreText = "WHAT ARE YOU LOOKING FOR?";

  const pageCount = 4;

  let currentPage = 0;
  let currentProgress = 0;
  let isSnapping = false;
  let touchStartY = 0;

  let secondStarted = false;
  let thirdStarted = false;
  let fourthStarted = false;
  let exploreStarted = false;

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
      typeText(secondTypingText, secondText, 55);
    }

    if (toThird > 0.72 && !thirdStarted) {
      thirdStarted = true;
      typeText(thirdTypingText, thirdText, 55);
    }

    if (toFourth > 0.72 && !fourthStarted) {
      fourthStarted = true;
      typeText(fourthTypingText, fourthText, 55);
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

  function isExploreOpen() {
    return exploreOverlay && exploreOverlay.classList.contains("is-open");
  }

  function handleWheel(event) {
    if (isExploreOpen()) return;

    event.preventDefault();

    if (isSnapping) return;

    if (event.deltaY > 0) {
      snapToPage(currentPage + 1);
    } else if (event.deltaY < 0) {
      snapToPage(currentPage - 1);
    }
  }

  function handleKeydown(event) {
    if (isExploreOpen() || isSnapping) return;

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
    if (isExploreOpen() || isSnapping) return;

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

    if (!exploreOverlay || !tagForm) return;

    exploreOverlay.classList.add("is-open");

    if (exploreStarted) return;

    exploreStarted = true;

    setTimeout(() => {
      typeText(exploreTypingText, exploreText, 60, () => {
        tagForm.classList.add("is-visible");
      });
    }, 500);
  }

  function closeExploreOverlay() {
    if (!exploreOverlay) return;

    exploreOverlay.classList.remove("is-open");
    snapToPage(3);
  }

  function openLoadingPage() {
    if (!exploreOverlay || !loadingPage) return;

    const selectedOverlayTags = selectedTags
      ? [...selectedTags.querySelectorAll(".selected-tag")].map((tag) => tag.dataset.filter)
      : [];

    sessionStorage.setItem("portfolioSelectedTags", JSON.stringify(selectedOverlayTags));

    exploreOverlay.classList.remove("is-open");
    loadingPage.classList.add("is-open");

    setTimeout(() => {
      window.location.href = "works.html";
    }, 3200);
  }

  function animateRemainingTags(beforeRects) {
    if (!tagOptions) return;

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

  function createSelectedTag(label, sourceButton) {
    const tag = document.createElement("span");
    tag.className = "selected-tag";
    tag.dataset.filter = label;
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

  function animateTagToBar(button) {
    if (!tagOptions || !selectedTags || !tagInput) return;

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
    if (!tagOptions) return;

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

  typeText(document.getElementById("typingText"), firstText, 90);
  setAnimationProgress(0);

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });

  window.addEventListener("resize", () => {
    window.scrollTo(0, currentPage * window.innerHeight);
    setAnimationProgress(currentPage / (pageCount - 1));
  });

  if (exploreButton) {
    exploreButton.addEventListener("click", openExploreOverlay);
  }

  if (overlayBackButton) {
    overlayBackButton.addEventListener("click", closeExploreOverlay);
  }

  if (continueButton) {
    continueButton.addEventListener("click", openLoadingPage);
  }

  if (tagOptions) {
    tagOptions.addEventListener("click", (event) => {
      const button = event.target.closest("button");

      if (!button || button.hidden || button.style.visibility === "hidden") return;

      animateTagToBar(button);
    });
  }
}

/* WORKS PAGE */

function initWorksPage() {
  const worksStack = document.getElementById("worksStack");
  if (!worksStack) return;

  const allWorkCards = [...worksStack.querySelectorAll(".work-card")];
  const activeFiltersWrap = document.getElementById("activeFilters");
  const editFiltersButton = document.getElementById("editFiltersButton");
  const filterMenu = document.getElementById("filterMenu");
  const closeFilterMenu = document.getElementById("closeFilterMenu");
  const filterOptions = document.getElementById("filterOptions");
  const applyFiltersButton = document.getElementById("applyFiltersButton");

  function getInitialFilters() {
    const params = new URLSearchParams(window.location.search);

    if (params.get("filters") === "all") {
      sessionStorage.removeItem("portfolioSelectedTags");
      return new Set();
    }

    const savedTags = sessionStorage.getItem("portfolioSelectedTags");

    if (!savedTags) {
      return new Set();
    }

    try {
      return new Set(JSON.parse(savedTags));
    } catch {
      return new Set();
    }
  }
  
  let activeFilters = getInitialFilters();
  let draftFilters = new Set(activeFilters);
  let currentWorkIndex = 0;
  let workSnapping = false;
  let workTouchStartY = 0;

  function getCardTags(card) {
    return [...card.querySelectorAll(".work-tags span")].map((tag) => tag.textContent.trim());
  }

  function getVisibleCards() {
    return allWorkCards.filter((card) => !card.hidden);
  }

  function renderActiveFilterBar() {
    if (!activeFiltersWrap) return;

    activeFiltersWrap.innerHTML = "";

    [...activeFilters].forEach((filter) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.filter = filter;
      button.innerHTML = `${filter} <span>×</span>`;
      activeFiltersWrap.appendChild(button);
    });
  }

  function renderFilterMenu() {
    if (!filterOptions) return;

    filterOptions.querySelectorAll("button").forEach((button) => {
      const filter = button.dataset.filter;
      const isActive = draftFilters.has(filter);
      const icon = button.querySelector("span");

      button.classList.toggle("is-active", isActive);

      icon.innerHTML = isActive
        ? '<img src="assets/correct-signal-svgrepo-com.svg" alt="">'
        : "×";
    });
  }

  function buildWorkDots() {
    const visibleCards = getVisibleCards();

    allWorkCards.forEach((card) => {
      const dotsWrap = card.querySelector(".work-dots");
      if (!dotsWrap) return;

      dotsWrap.innerHTML = "";

      visibleCards.forEach((visibleCard) => {
        const dot = document.createElement("span");

        if (visibleCard === card) {
          dot.classList.add("active");
        }

        dotsWrap.appendChild(dot);
      });
    });
  }

  function applyWorkFilters() {
    allWorkCards.forEach((card) => {
      const cardTags = getCardTags(card);
      const matches =
        activeFilters.size === 0 ||
        [...activeFilters].some((filter) => cardTags.includes(filter));

      card.hidden = !matches;
    });

    currentWorkIndex = 0;
    worksStack.scrollTop = 0;
    renderActiveFilterBar();
    buildWorkDots();
  }

  function snapToWorkCard(index) {
    const visibleCards = getVisibleCards();
    if (visibleCards.length === 0) return;

    const nextIndex = clamp(index, 0, visibleCards.length - 1);

    if (nextIndex === currentWorkIndex || workSnapping) return;

    workSnapping = true;

    const startTop = worksStack.scrollTop;
    const endTop = visibleCards[nextIndex].offsetTop;
    const startTime = performance.now();
    const duration = 1050;

    currentWorkIndex = nextIndex;

    function animateScroll(now) {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeFloaty(progress);

      worksStack.scrollTop = startTop + (endTop - startTop) * eased;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        worksStack.scrollTop = endTop;
        workSnapping = false;
      }
    }

    requestAnimationFrame(animateScroll);
  }

  if (editFiltersButton && filterMenu) {
    editFiltersButton.addEventListener("click", () => {
      draftFilters = new Set(activeFilters);
      renderFilterMenu();
      filterMenu.classList.add("is-open");
    });
  }

  if (closeFilterMenu && filterMenu) {
    closeFilterMenu.addEventListener("click", () => {
      filterMenu.classList.remove("is-open");
    });
  }

  if (filterOptions) {
    filterOptions.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      const filter = button.dataset.filter;

      if (draftFilters.has(filter)) {
        draftFilters.delete(filter);
      } else {
        draftFilters.add(filter);
      }

      renderFilterMenu();
    });
  }

  if (applyFiltersButton && filterMenu) {
    applyFiltersButton.addEventListener("click", () => {
      activeFilters = new Set(draftFilters);
      filterMenu.classList.remove("is-open");
      applyWorkFilters();
    });
  }

  if (activeFiltersWrap) {
    activeFiltersWrap.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      activeFilters.delete(button.dataset.filter);
      applyWorkFilters();
    });
  }

  worksStack.addEventListener("wheel", (event) => {
    event.preventDefault();

    if (workSnapping || (filterMenu && filterMenu.classList.contains("is-open"))) return;

    if (event.deltaY > 0) {
      snapToWorkCard(currentWorkIndex + 1);
    } else if (event.deltaY < 0) {
      snapToWorkCard(currentWorkIndex - 1);
    }
  }, { passive: false });

  worksStack.addEventListener("touchstart", (event) => {
    workTouchStartY = event.touches[0].clientY;
  }, { passive: true });

  worksStack.addEventListener("touchend", (event) => {
    if (workSnapping || (filterMenu && filterMenu.classList.contains("is-open"))) return;

    const touchEndY = event.changedTouches[0].clientY;
    const difference = workTouchStartY - touchEndY;

    if (Math.abs(difference) < 40) return;

    if (difference > 0) {
      snapToWorkCard(currentWorkIndex + 1);
    } else {
      snapToWorkCard(currentWorkIndex - 1);
    }
  }, { passive: true });

  renderActiveFilterBar();
  renderFilterMenu();
  applyWorkFilters();
}

document.addEventListener("DOMContentLoaded", () => {
  initHomePage();
  initWorksPage();
});