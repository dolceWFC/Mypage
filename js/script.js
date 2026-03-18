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
   Shared Slide HTML
========================= */
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

/* =========================
   Generic Slider
========================= */
function initGarageSlider({
  data,
  stage,
  dots,
  prevBtn,
  nextBtn,
  section
}) {
  if (!data || data.length === 0 || !stage || !dots || !prevBtn || !nextBtn) {
    return;
  }

  let currentIndex = 0;
  let isAnimating = false;
  let touchStartX = 0;
  let touchEndX = 0;
  const swipeThreshold = 50;

  function setStageMinHeight() {
    const originalContent = stage.innerHTML;
    const originalHeight = stage.style.height;
    const originalMinHeight = stage.style.minHeight;

    stage.innerHTML = "";
    stage.style.height = "";
    stage.style.minHeight = "";

    let maxHeight = 0;

    data.forEach((car) => {
      const slide = createGarageSlide(car);
      slide.style.position = "absolute";
      slide.style.visibility = "hidden";
      slide.style.pointerEvents = "none";
      slide.style.width = "100%";

      stage.appendChild(slide);
      maxHeight = Math.max(maxHeight, slide.offsetHeight);
      stage.removeChild(slide);
    });

    stage.style.minHeight = "";
    stage.innerHTML = originalContent;
    stage.style.height = originalHeight;
    stage.style.minHeight = `${maxHeight}px`;
  }

  function updateDots() {
    const dotEls = dots.querySelectorAll(".garage-dot");
    dotEls.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
      dot.setAttribute(
        "aria-label",
        index === currentIndex
          ? `現在表示中: ${data[index].title}`
          : `${data[index].title} を表示`
      );
    });
  }

  function createDots() {
    dots.innerHTML = "";

    data.forEach((car, index) => {
      const dot = document.createElement("button");
      dot.className = "garage-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `${car.title} を表示`);

      dot.addEventListener("click", () => {
        if (isAnimating || index === currentIndex) return;

        const direction = index < currentIndex ? "prev" : "next";
        currentIndex = index;
        updateSlide(currentIndex, direction);
      });

      dots.appendChild(dot);
    });

    updateDots();
  }

  function renderInitialSlide(index) {
    stage.innerHTML = "";
    const slide = createGarageSlide(data[index]);
    stage.appendChild(slide);
    updateDots();
  }

  function updateSlide(index, direction) {
    if (isAnimating) return;
    isAnimating = true;

    const currentSlide = stage.querySelector(".garage-slide");
    const nextSlide = createGarageSlide(data[index]);

    const stageHeight = stage.offsetHeight;
    stage.style.height = `${stageHeight}px`;

    currentSlide.classList.add("is-animating");
    nextSlide.classList.add("is-animating");

    if (direction === "prev") {
      nextSlide.classList.add("slide-enter-left");
    } else {
      nextSlide.classList.add("slide-enter-right");
    }

    stage.appendChild(nextSlide);
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
      stage.innerHTML = "";
      const settledSlide = createGarageSlide(data[index]);
      stage.appendChild(settledSlide);

      requestAnimationFrame(() => {
        stage.style.height = "";
      });

      updateDots();
      isAnimating = false;
    }, 400);
  }

  function goPrev() {
    if (isAnimating || data.length === 0) return;
    currentIndex = (currentIndex - 1 + data.length) % data.length;
    updateSlide(currentIndex, "prev");
  }

  function goNext() {
    if (isAnimating || data.length === 0) return;
    currentIndex = (currentIndex + 1) % data.length;
    updateSlide(currentIndex, "next");
  }

  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);

  document.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement?.tagName;
    const isTyping =
      activeTag === "INPUT" ||
      activeTag === "TEXTAREA" ||
      document.activeElement?.isContentEditable;

    if (isTyping) return;

    const rect = section?.getBoundingClientRect();
    const visible = rect
      ? rect.top < window.innerHeight && rect.bottom > 0
      : true;

    if (!visible) return;

    if (e.key === "ArrowLeft") {
      goPrev();
    } else if (e.key === "ArrowRight") {
      goNext();
    }
  });

  if (section) {
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

      const rect = section.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;

      if (!visible) return;

      if (e.clientX < window.innerWidth / 2) {
        goPrev();
      } else {
        goNext();
      }
    });
  }

  stage.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchEndX = touchStartX;
    },
    { passive: true }
  );

  stage.addEventListener(
    "touchmove",
    (e) => {
      touchEndX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );

  stage.addEventListener(
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

  renderInitialSlide(currentIndex);
  setStageMinHeight();
  createDots();
}

/* =========================
   Links
========================= */
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
  pen: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58ZM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.29a1 1 0 0 0-1.41 0L15.13 5.12l3.75 3.75 1.83-1.83Z"/>
    </svg>
  `,
  instagram: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm5.38-2.57a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24Z"/>
    </svg>
  `
};

function renderLinks() {
  const linksGrid = document.getElementById("linksGrid");
  if (!linksGrid) return;

  linksGrid.innerHTML = "";

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
}

/* =========================
   Data Load
========================= */
async function loadSliders() {
  try {
    const [carsResponse, archiveResponse] = await Promise.all([
      fetch("data/cars.json"),
      fetch("data/archive.json")
    ]);

    if (!carsResponse.ok) {
      throw new Error("cars.jsonの読み込みに失敗しました");
    }

    if (!archiveResponse.ok) {
      throw new Error("archive.jsonの読み込みに失敗しました");
    }

    const cars = await carsResponse.json();
    const archiveCars = await archiveResponse.json();

    if (!Array.isArray(cars) || cars.length === 0) {
      throw new Error("cars.jsonの中身が空、または不正です");
    }

    if (!Array.isArray(archiveCars) || archiveCars.length === 0) {
      throw new Error("archive.jsonの中身が空、または不正です");
    }

    initGarageSlider({
      data: cars,
      stage: document.getElementById("garageStage"),
      dots: document.getElementById("garageDots"),
      prevBtn: document.getElementById("prevCar"),
      nextBtn: document.getElementById("nextCar"),
      section: document.getElementById("garage")
    });

    initGarageSlider({
      data: archiveCars,
      stage: document.getElementById("archiveStage"),
      dots: document.getElementById("archiveDots"),
      prevBtn: document.getElementById("prevArchive"),
      nextBtn: document.getElementById("nextArchive"),
      section: document.querySelector(".garage-archive-section")
    });
  } catch (error) {
    console.error(error);

    const garageStage = document.getElementById("garageStage");
    const archiveStage = document.getElementById("archiveStage");

    if (garageStage) {
      garageStage.innerHTML = `
        <div class="garage-slide">
          <div class="garage-text">
            <h2>Garage data could not be loaded.</h2>
            <p>cars.json の読み込みに失敗しました。ファイル配置を確認してください。</p>
          </div>
        </div>
      `;
    }

    if (archiveStage) {
      archiveStage.innerHTML = `
        <div class="garage-slide">
          <div class="garage-text">
            <h2>Archive data could not be loaded.</h2>
            <p>archive.json の読み込みに失敗しました。ファイル配置を確認してください。</p>
          </div>
        </div>
      `;
    }
  }
}

/* =========================
   Contact Form + Footer Year
========================= */
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  renderLinks();
  loadSliders();

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
});