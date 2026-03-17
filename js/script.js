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
    </div>
  `;
  return slide;
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