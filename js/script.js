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
/* =========================
   Garage Slider
========================= */
let cars = [];
let currentIndex = 0;
let isAnimating = false;

const prevCar = document.getElementById("prevCar");
const nextCar = document.getElementById("nextCar");
const garageStage = document.getElementById("garageStage");

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

function renderInitialCar(index) {
  garageStage.innerHTML = "";
  const slide = createGarageSlide(cars[index]);
  garageStage.appendChild(slide);
}

function updateCar(index, direction) {
  if (isAnimating) return;
  isAnimating = true;

  const currentSlide = garageStage.querySelector(".garage-slide");
  const nextSlide = createGarageSlide(cars[index]);

  currentSlide.classList.add("is-animating");
  nextSlide.classList.add("garage-slide", "is-animating");

  if (direction === "prev") {
    // 左ボタン: 右に消えて、左から入る
    nextSlide.classList.add("slide-enter-left");
  } else {
    // 右ボタン: 左に消えて、右から入る
    nextSlide.classList.add("slide-enter-right");
  }

  garageStage.appendChild(nextSlide);

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
    isAnimating = false;
  }, 400);
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

    prevCar.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + cars.length) % cars.length;
      updateCar(currentIndex, "prev");
    });

    nextCar.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % cars.length;
      updateCar(currentIndex, "next");
    });
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