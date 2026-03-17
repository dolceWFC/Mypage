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

const prevCar = document.getElementById("prevCar");
const nextCar = document.getElementById("nextCar");
const garageContent = document.querySelector(".garage-content");
const garageMedia = document.getElementById("garageMedia");
const garageText = document.getElementById("garageText");

function renderCar(index) {
  const car = cars[index];

  garageMedia.innerHTML = `
    <img
      src="${car.image}"
      alt="${car.alt}"
      class="garage-image"
    >
  `;

  garageText.innerHTML = `
    <h2>${car.title}</h2>
    <p>${car.description}</p>
  `;
}

function updateCar(index, direction) {
  const outClass = direction === "prev" ? "slide-out-left" : "slide-out-right";
  const inClass = direction === "prev" ? "slide-in-right" : "slide-in-left";

  garageContent.classList.add(outClass);

  setTimeout(() => {
    garageContent.classList.remove(outClass);

    renderCar(index);

    garageContent.style.transition = "none";
    garageContent.classList.add(inClass);

    void garageContent.offsetWidth;

    garageContent.style.transition = "transform 0.4s ease, opacity 0.4s ease";
    garageContent.classList.remove(inClass);
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

    renderCar(currentIndex);

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
    garageText.innerHTML = `
      <h2>Garage data could not be loaded.</h2>
      <p>cars.json の読み込みに失敗しました。ファイル配置を確認してください。</p>
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