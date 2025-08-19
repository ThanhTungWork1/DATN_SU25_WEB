import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "../assets/image/banner1.png";
import banner2 from "../assets/image/banner2.png";
import banner3 from "../assets/image/banner3.png";
import "../assets/styles/slideShow.css";
import publicAxios from "../utils/publicAxios";

type ApiBanner = {
  id: number;
  image_url: string;
  status: boolean;
};

const localFallback = [
  { id: 1, image: banner1, alt: "Banner Thời Trang 1" },
  { id: 2, image: banner2, alt: "Banner Thời Trang 2" },
  { id: 3, image: banner3, alt: "Banner Thời Trang 3" },
];

export default function Slideshow() {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState<{ id: number; image: string; alt: string }[]>(
    localFallback
  );
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (paused || banners.length < 2) return; // không auto nếu chỉ có 1 banner
    const interval = setInterval(() => {
      nextSlide();
    }, 3000); // 3 giây/slide
    return () => clearInterval(interval);
  }, [current, paused, banners.length]);

  // Load banner từ API (chỉ banner đang bật)
  useEffect(() => {
    let mounted = true;

    const fetchBanners = async () => {
      try {
        // cache-busting tránh cache ở trình duyệt/proxy
        const res = await publicAxios.get<{ data: ApiBanner[] }>(`/banners?t=${Date.now()}`);
        const list = (res.data?.data || []).filter((b) => b.status);
        if (!mounted) return;
        if (list.length > 0) {
          // Chỉ lấy 3 banner đầu cho slider (Banner 1–3)
          const top3 = list.slice(0, 3);
          const next = top3.map((b, idx) => ({
            id: b.id,
            // thêm query để ảnh không bị cache khi vừa cập nhật
            image: `${b.image_url}${b.image_url.includes("?") ? "&" : "?"}t=${Date.now()}`,
            alt: `Banner ${idx + 1}`,
          }));
          // chỉ cập nhật nếu thay đổi để tránh nhấp nháy
          const changed =
            next.length !== banners.length ||
            next.some((n, i) => !banners[i] || banners[i].id !== n.id || banners[i].image !== n.image);
          if (changed) {
            setBanners(next);
            setCurrent(0);
          }
        }
      } catch (e) {
        // giữ fallback local nếu lỗi
      }
    };

    // fetch lần đầu
    fetchBanners();
    // polling 30s
    const timer = setInterval(fetchBanners, 30000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [banners]);

  return (
    <div
      className="slideshow-container"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="slideshow-viewport"
        onTouchStart={(e) => {
          setTouchStartX(e.changedTouches[0].clientX);
          setTouchEndX(null);
        }}
        onTouchMove={(e) => setTouchEndX(e.changedTouches[0].clientX)}
        onTouchEnd={() => {
          if (touchStartX !== null && touchEndX !== null) {
            const delta = touchEndX - touchStartX;
            if (delta > 50) prevSlide();
            if (delta < -50) nextSlide();
          }
          setTouchStartX(null);
          setTouchEndX(null);
        }}
      >
        <div
          className="slideshow-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner) => (
            <div className="slideshow-slide" key={banner.id}>
              <img src={banner.image} alt={banner.alt} />
            </div>
          ))}
        </div>
      </div>

      {/* Nút điều hướng */}
      <button onClick={prevSlide} className="slideshow-arrow left">
        <ChevronLeft />
        {/* <FaChevronLeft /> */}
      </button>
      <button onClick={nextSlide} className="slideshow-arrow right">
        <ChevronRight />

        {/* <FaChevronRight /> */}
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
