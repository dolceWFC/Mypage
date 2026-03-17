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
const cars = [
  {
    title: "Alfa Romeo 156 GTA",
    image: "images/156gta.jpg",
    alt: "Alfa Romeo 156 GTA",
    description:
      "FFアルファロメオの到達点。最高峰のデザインと官能的なサウンド、デビュー当時の市販車としてはFFトップのパワーを併せ持つ、全知全能のメインカー。"
  },
  {
    title: "Alfa Romeo MiTo Quadrifoglio Verde",
    image: "images/mito.jpg",
    alt: "Alfa Romeo MiTo",
    description:
      "現代車らしい、小排気量を感じさせないトルクフルなパワー感、細かい電装品すらもそうそう壊れない頑丈さを持ちながらも、アルファロメオとしての世界観を受け継ぐ1台。"
  },
  {
    title: "Mazda Roadster Special Package",
    image: "images/nb.jpg",
    alt: "Mazda Roadster",
    description:
      "日本が誇る傑作ライトウェイト。低速域のドライブの楽しさと低燃費で、日常を彩ってくれる。"
  }
];

let currentIndex = 0;

const carImage = document.getElementById("carImage");
const carTitle = document.getElementById("carTitle");
const carDescription = document.getElementById("carDescription");
const prevCar = document.getElementById("prevCar");
const nextCar = document.getElementById("nextCar");
const garageContent = document.querySelector(".garage-content");

function updateCar(index, direction) {
  const outClass = direction === "prev" ? "slide-out-left" : "slide-out-right";
  const inClass = direction === "prev" ? "slide-in-right" : "slide-in-left";

  garageContent.classList.add(outClass);

  setTimeout(() => {
    garageContent.classList.remove(outClass);

    carImage.src = cars[index].image;
    carImage.alt = cars[index].alt;
    carTitle.textContent = cars[index].title;
    carDescription.textContent = cars[index].description;

    garageContent.style.transition = "none";
    garageContent.classList.add(inClass);

    void garageContent.offsetWidth;

    garageContent.style.transition = "transform 0.4s ease, opacity 0.4s ease";
    garageContent.classList.remove(inClass);
  }, 400);
}

prevCar.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + cars.length) % cars.length;
  updateCar(currentIndex, "prev");
});

nextCar.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % cars.length;
  updateCar(currentIndex, "next");
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
});