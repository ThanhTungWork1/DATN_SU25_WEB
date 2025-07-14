import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "../assets/image/banner1.png";
import banner2 from "../assets/image/banner2.png";
import banner3 from "../assets/image/banner3.png";
import "../assets/styles/slideShow.css";

const banners = [
  {
    id: 1,
    image: banner1,
    alt: "Banner Thời Trang 1",
  },
  {
    id: 2,
    image: banner2,
    alt: "Banner Thời Trang 2",
  },
  {
    id: 3,
    image: banner3,
    alt: "Banner Thời Trang 3",
  },
];

export default function Slideshow() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // 5 giây
    return () => clearInterval(interval);
  }, [current]);

  return (
    <div className="slideshow-container">
      {banners.map((banner, index) => (
        <img
          key={banner.id}
          src={banner.image}
          alt={banner.alt}
          className={`slideshow-image transition-opacity duration-700 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        />
      ))}

      {/* Nút điều hướng */}
      <button
        onClick={prevSlide}
        className="slideshow-arrow left"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={nextSlide}
        className="slideshow-arrow right"
      >
        <ChevronRight />
      </button>

      {/* Dot indicator */}
      <div className="slideshow-dots">
        {banners.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`slideshow-dot${i === current ? " active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
