/* =========================
   Section Fade-in
========================= */
const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      } else {
        entry.target.classList.remove("active");
      }
    });
  },
  {
    threshold: 0.6
  }
);

sections.forEach((section) => {
  observer.observe(section);
});

/* =========================
   Garage Slider
========================= */
let cars = [];
let currentIndex = 0;
let isAnimating = false;

const prevCar = document.getElementById("prevCar");
const nextCar = document.getElementById("nextCar");
const garageStage = document.getElementById("garageStage");
const garageDots = document.getElementById("garageDots");
const garageSection = document.getElementById("garage");

let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;

function createSpecsHtml(specs) {
  if (!specs) return "";

  return `
    <div class="garage-specs">
      ${Object.entries(specs)
      .map(
        ([label, value]) => `
            <div class="garage-spec-item">
              <span class="garage-spec-label">${label}</span>
              <span class="garage-spec-value">${value}</span>
            </div>
          `
      )
      .join("")}
    </div>
  `;
}

function createGarageSlide(car) {
  const slide = document.createElement("div");
  slide.className = "garage-slide";
  slide.innerHTML = `
    <div class="garage-image-wrap">
      <img
        src="${car.image}"
        alt="${car.alt}"
        class="garage-image"
      >
    </div>

    <div class="garage-text">
      <h2>${car.title}</h2>
      <p>${car.description}</p>
      ${createSpecsHtml(car.specs)}
    </div>
  `;
  return slide;
}

function setGarageStageMinHeight() {
  const originalContent = garageStage.innerHTML;
  const originalHeight = garageStage.style.height;
  const originalMinHeight = garageStage.style.minHeight;

  garageStage.innerHTML = "";
  garageStage.style.height = "";
  garageStage.style.minHeight = "";

  let maxHeight = 0;

  cars.forEach((car) => {
    const slide = createGarageSlide(car);
    slide.style.position = "absolute";
    slide.style.visibility = "hidden";
    slide.style.pointerEvents = "none";
    slide.style.width = "100%";

    garageStage.appendChild(slide);
    maxHeight = Math.max(maxHeight, slide.offsetHeight);
    garageStage.removeChild(slide);
  });

  garageStage.style.minHeight = "";
  garageStage.innerHTML = originalContent;
  garageStage.style.height = originalHeight;
  garageStage.style.minHeight = `${maxHeight}px`;
}

function updateDots() {
  const dots = garageDots.querySelectorAll(".garage-dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentIndex);
    dot.setAttribute(
      "aria-label",
      index === currentIndex
        ? `現在表示中: ${cars[index].title}`
        : `${cars[index].title} を表示`
    );
  });
}

function createDots() {
  garageDots.innerHTML = "";

  cars.forEach((car, index) => {
    const dot = document.createElement("button");
    dot.className = "garage-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `${car.title} を表示`);

    dot.addEventListener("click", () => {
      if (isAnimating || index === currentIndex) return;

      const direction = index < currentIndex ? "prev" : "next";
      currentIndex = index;
      updateCar(currentIndex, direction);
    });

    garageDots.appendChild(dot);
  });

  updateDots();
}

function renderInitialCar(index) {
  garageStage.innerHTML = "";
  const slide = createGarageSlide(cars[index]);
  garageStage.appendChild(slide);
  updateDots();
}

function updateCar(index, direction) {
  if (isAnimating) return;
  isAnimating = true;

  const currentSlide = garageStage.querySelector(".garage-slide");
  const nextSlide = createGarageSlide(cars[index]);

  // 現在の高さを固定して、absolute化で親が潰れるのを防ぐ
  const stageHeight = garageStage.offsetHeight;
  garageStage.style.height = `${stageHeight}px`;

  currentSlide.classList.add("is-animating");
  nextSlide.classList.add("is-animating");

  if (direction === "prev") {
    // 左ボタン: 右に消えて、左から入る
    nextSlide.classList.add("slide-enter-left");
  } else {
    // 右ボタン: 左に消えて、右から入る
    nextSlide.classList.add("slide-enter-right");
  }

  garageStage.appendChild(nextSlide);
  updateDots();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (direction === "prev") {
        currentSlide.classList.add("slide-leave-right");
      } else {
        currentSlide.classList.add("slide-leave-left");
      }

      nextSlide.classList.add("slide-enter-active");
      nextSlide.classList.remove("slide-enter-left", "slide-enter-right");
    });
  });

  setTimeout(() => {
    garageStage.innerHTML = "";
    const settledSlide = createGarageSlide(cars[index]);
    garageStage.appendChild(settledSlide);

    // 新しいスライドの高さに合わせて固定を解除
    requestAnimationFrame(() => {
      garageStage.style.height = "";
    });

    updateDots();
    isAnimating = false;
  }, 400);
}

function goPrev() {
  if (isAnimating || cars.length === 0) return;
  currentIndex = (currentIndex - 1 + cars.length) % cars.length;
  updateCar(currentIndex, "prev");
}

function goNext() {
  if (isAnimating || cars.length === 0) return;
  currentIndex = (currentIndex + 1) % cars.length;
  updateCar(currentIndex, "next");
}

function bindGarageControls() {
  prevCar.addEventListener("click", goPrev);
  nextCar.addEventListener("click", goNext);

  document.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement?.tagName;
    const isTyping =
      activeTag === "INPUT" ||
      activeTag === "TEXTAREA" ||
      document.activeElement?.isContentEditable;

    if (isTyping) return;

    if (e.key === "ArrowLeft") {
      goPrev();
    } else if (e.key === "ArrowRight") {
      goNext();
    }
  });

  document.addEventListener("click", (e) => {
    const isInteractive =
      e.target.closest(".garage-arrow") ||
      e.target.closest(".garage-dots") ||
      e.target.closest("a") ||
      e.target.closest("button") ||
      e.target.closest("input") ||
      e.target.closest("textarea") ||
      e.target.closest("label");

    if (isInteractive) return;

    const rect = garageSection.getBoundingClientRect();
    const garageVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (!garageVisible) return;

    if (e.clientX < window.innerWidth / 2) {
      goPrev();
    } else {
      goNext();
    }
  });

  garageStage.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchEndX = touchStartX;
    },
    { passive: true }
  );

  garageStage.addEventListener(
    "touchmove",
    (e) => {
      touchEndX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );

  garageStage.addEventListener(
    "touchend",
    () => {
      const diffX = touchEndX - touchStartX;

      if (Math.abs(diffX) < swipeThreshold) return;

      if (diffX > 0) {
        goPrev();
      } else {
        goNext();
      }
    },
    { passive: true }
  );
}

async function loadCars() {
  try {
    const response = await fetch("data/cars.json");

    if (!response.ok) {
      throw new Error("cars.jsonの読み込みに失敗しました");
    }

    cars = await response.json();

    if (!Array.isArray(cars) || cars.length === 0) {
      throw new Error("cars.jsonの中身が空、または不正です");
    }

    renderInitialCar(currentIndex);
    setGarageStageMinHeight();
    createDots();
    bindGarageControls();
  } catch (error) {
    console.error(error);
    garageStage.innerHTML = `
      <div class="garage-slide">
        <div class="garage-text">
          <h2>Garage data could not be loaded.</h2>
          <p>cars.json の読み込みに失敗しました。ファイル配置を確認してください。</p>
        </div>
      </div>
    `;
  }
}

// garage-archive用拡張

function initSlider(data, stage, dots, prevBtn, nextBtn) {
  let index = 0;
  let animating = false;

  function render(i) {
    stage.innerHTML = "";
    stage.appendChild(createGarageSlide(data[i]));
  }

  function update(i, dir) {
    if (animating) return;
    animating = true;

    const current = stage.querySelector(".garage-slide");
    const next = createGarageSlide(data[i]);

    stage.style.height = stage.offsetHeight + "px";

    current.classList.add("is-animating");
    next.classList.add("is-animating");

    next.classList.add(dir === "prev" ? "slide-enter-left" : "slide-enter-right");

    stage.appendChild(next);

    requestAnimationFrame(() => {
      current.classList.add(dir === "prev" ? "slide-leave-right" : "slide-leave-left");
      next.classList.add("slide-enter-active");
    });

    setTimeout(() => {
      render(i);
      stage.style.height = "";
      animating = false;
    }, 400);
  }

  prevBtn.onclick = () => {
    index = (index - 1 + data.length) % data.length;
    update(index, "prev");
  };

  nextBtn.onclick = () => {
    index = (index + 1) % data.length;
    update(index, "next");
  };

  render(index);
}

const linksData = [
  {
    name: "Blog",
    desc: "車関連がメインのブログ、友人たちと共著です",
    url: "https://tsukubanyan.racing/",
    icon: "pen"
  },
  {
    name: "GitHub",
    desc: "エンジニアではないので更新はまちまち",
    url: "https://github.com/dolceWFC",
    icon: "github"
  },
  {
    name: "Twitter",
    desc: "もっともよく動かしているSNS",
    url: "https://x.com/rhea_rue_",
    icon: "x"
  },
  {
    name: "Instagram",
    desc: "更新したい",
    url: "https://instagram.com/rhea_rue_",
    icon: "instagram"
  }
];

const iconMap = {
  github: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.01-.02-1.98-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.69-1.28-1.69-1.05-.71.08-.69.08-.69 1.16.08 1.78 1.19 1.78 1.19 1.03 1.77 2.7 1.26 3.36.97.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.27-5.23-5.68 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.67.41.36.78 1.09.78 2.19 0 1.58-.01 2.85-.01 3.24 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
      </svg>
    `,
  x: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.9 2H21l-6.87 7.85L22.2 22h-6.32l-4.95-7.27L4.57 22H2.46l7.35-8.4L2 2h6.48l4.47 6.68L18.9 2Zm-1.11 18h1.75L7.53 3.89H5.65L17.79 20Z"/>
      </svg>
    `,
  globe: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm6.93 9h-3.02a15.64 15.64 0 0 0-1.38-5.03A8.03 8.03 0 0 1 18.93 11ZM12 4.06c.95 1.16 1.82 3.18 2.12 5.94H9.88C10.18 7.24 11.05 5.22 12 4.06ZM4.07 13h3.02a15.64 15.64 0 0 0 1.38 5.03A8.03 8.03 0 0 1 4.07 13Zm3.02-2H4.07a8.03 8.03 0 0 1 4.4-5.03A15.64 15.64 0 0 0 7.09 11ZM12 19.94c-.95-1.16-1.82-3.18-2.12-5.94h4.24c-.3 2.76-1.17 4.78-2.12 5.94ZM14.34 13H9.66a13.58 13.58 0 0 1 0-2h4.68a13.58 13.58 0 0 1 0 2Zm.19 5.03A15.64 15.64 0 0 0 15.91 13h3.02a8.03 8.03 0 0 1-4.4 5.03Z"/>
      </svg>
    `,
  pen: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58ZM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.29a1 1 0 0 0-1.41 0L15.13 5.12l3.75 3.75 1.83-1.83Z"/>
      </svg>
    `,
  instagram: `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm5.38-2.57a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24Z"/>
  </svg>
    `,
  tnr: `
  <svg viewBox="0 0 210 210" aria-hidden="true">
    <path d="m 31.414631,62.059334 c -0.315716,-0.0016 -0.62218,0.04157 -0.914156,0.137976 -3.223195,1.064286 -6.864508,14.156242 -4.792989,14.156242 H 41.826399 V 130.50632 H 54.363101 V 76.353552 h 19.025195 c 1.56498,0 -2.230321,-13.091943 -5.453414,-14.156242 -3.114269,-1.028364 -7.879622,4.040064 -7.879622,4.040064 H 38.380614 c 0,0 -3.914064,-4.16295 -6.965983,-4.17804 z"/>
    <path d="m 60.966821,83.219728 c 0,0 15.224498,-0.228022 16.118913,-1.122413 3.090049,-3.089967 1.257006,-8.250554 5.16e-4,-11.786877 -0.847609,-2.385549 -2.260689,-5.892146 -4.792472,-5.892146 -2.524182,0 -7.879622,5.892146 -7.879622,5.892146 -3.053102,3.632532 -5.167127,7.986425 -3.447335,12.90929 z"/>
    <path d="m 32.077112,65.476624 c -2.526476,0 -4.137564,3.437519 -4.791956,5.879744 -0.95062,3.547762 -2.904903,10.218326 -0.001,13.122196 0.98482,0.98482 16.118912,1.122413 16.118912,1.122413 v 53.030353 h 12.53667 V 85.600977 c 0,0 15.224498,-0.228022 16.118913,-1.122413 3.090049,-3.089967 1.257006,-9.573471 5.16e-4,-13.109794 -0.847609,-2.385549 -2.260689,-5.892146 -4.792472,-5.892146 -2.524182,0 -7.879622,5.892146 -7.879622,5.892146 H 39.957251 c 0,0 -5.353663,-5.892146 -7.880139,-5.892146 z"/>
  </svg>
  `,
};

const linksGrid = document.getElementById("linksGrid");

linksData.forEach((link) => {
  const card = document.createElement("a");
  card.href = link.url;
  card.className = "link-card";

  if (link.url.startsWith("http")) {
    card.target = "_blank";
    card.rel = "noopener noreferrer";
  }

  card.innerHTML = `
      <div class="link-card-top">
        <div class="link-icon">
          ${iconMap[link.icon] || ""}
        </div>
        <span class="link-name">${link.name}</span>
      </div>
      <span class="link-desc">${link.desc}</span>
    `;

  linksGrid.appendChild(card);
});

/* =========================
   Contact Form + Footer Year
========================= */
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  const form = document.getElementById("contactForm");
  const message = document.getElementById("formMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/xpqjpbyq", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      });

      if (response.ok) {
        message.style.display = "block";
        message.style.color = "#0f0";
        message.textContent = "Thank you! Your message has been sent.";
        form.reset();
      } else {
        message.style.display = "block";
        message.style.color = "#f33";
        message.textContent = "Oops! There was a problem.";
      }
    } catch (error) {
      message.style.display = "block";
      message.style.color = "#f33";
      message.textContent = "Oops! Something went wrong.";
    }
  });

  loadCars();
});