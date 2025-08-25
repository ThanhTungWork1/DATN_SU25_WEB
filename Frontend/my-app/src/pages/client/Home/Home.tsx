import "../../../assets/styles/mess-fb-phone.css";
import "../../../assets/styles/home.css";
import "../../../assets/styles/responsive.css";
import Slideshow from "../../../components/SlideShow";
import TopProductsSection from "./TopProductsSection";
import ProductSection from "./ProductSection";
import { useEffect, useState } from "react";
import publicAxios from "../../../utils/publicAxios";
import { useHomeSection } from "../../../hook/useHomeSection";

const HomePage = () => {
  const [smallBanners, setSmallBanners] = useState<string[]>(["", ""]);
  const [bigBanners, setBigBanners] = useState<string[]>(["", "", ""]);

  const fallbackUrls = [
    "https://deltasport.vn/wp-content/uploads/2025/05/swimwear.png",
    "https://deltasport.vn/wp-content/uploads/2025/05/racquet.png",
    "https://deltasport.vn/wp-content/uploads/2025/05/running.png",
  ];

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>, idx: number) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied === "1") return; // tránh loop
    img.dataset.fallbackApplied = "1";
    img.src = fallbackUrls[idx];
  };

  // Fetch banners
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await publicAxios.get<{ data: { id: number; image_url: string; status: boolean }[] }>(
          `/banners?t=${Date.now()}`
        );
        const active = (res.data?.data || [])
          .filter((b) => b.status)
          .sort((a, b) => a.id - b.id);

        const toUrl = (u?: string) =>
          u ? `${u}${u.includes("?") ? "&" : "?"}t=${Date.now()}` : "";

        const smallUrls = [toUrl(active[0]?.image_url), toUrl(active[1]?.image_url)];
        const bigUrls = [
          toUrl(active[2]?.image_url),
          toUrl(active[3]?.image_url),
          toUrl(active[4]?.image_url),
        ];

        if (mounted) {
          setSmallBanners(smallUrls);
          setBigBanners(bigUrls);
        }
      } catch (e) {
        console.warn("[Home] load banners error", e);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch sections
  const { sections = [], loading, error } = useHomeSection();

  if (loading) {
    return (
      <main>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div>Đang tải...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
          <div>Lỗi: {error}</div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Slideshow />
      <TopProductsSection />

      {/* Render sections từ DB */}
      {sections.map((section, index) => (
        <div key={section.id}>
          {section.products && section.products.length > 0 && (
            <ProductSection title={section.title} products={section.products} />
          )}

          {/* Banner xen kẽ */}
          {index === 0 && (
            <section className="double-banner" data-aos="fade-up">
              <img
                src="https://n7media.coolmate.me/uploads/June2025/men_84.jpg?aio=w-1069"
                alt="Banner 1"
                className="banner-small"
              />
              <img
                src="https://n7media.coolmate.me/uploads/June2025/women.jpg?aio=w-1069"
                alt="Banner 2"
                className="banner-small"
              />
            </section>
          )}

          {index === 1 && (
            <section className="single-banner" data-aos="fade-up">
              <img src={fallbackUrls[0]} alt="Banner lớn 1" />
            </section>
          )}

          {index === 2 && (
            <section className="single-banner" data-aos="fade-up">
              <img src={fallbackUrls[1]} alt="Banner lớn 2" />
            </section>
          )}

          {index === 3 && (
            <section className="single-banner" data-aos="fade-up">
              <img src={fallbackUrls[2]} alt="Banner lớn 3" />
            </section>
          )}
        </div>
      ))}


      {/* 2 banner nhỏ (DB id=1,2) */}
      <section className="double-banner" data-aos="fade-up">
        <img
          src={
            smallBanners[0] ||
            "https://n7media.coolmate.me/uploads/June2025/men_84.jpg?aio=w-1069"
          }
          alt="Banner 4"
          className="banner-small"
          onError={(e) =>
            ((e.currentTarget as HTMLImageElement).src =
              "https://n7media.coolmate.me/uploads/June2025/men_84.jpg?aio=w-1069")
          }
        />
        <img
          src={
            smallBanners[1] ||
            "https://n7media.coolmate.me/uploads/June2025/women.jpg?aio=w-1069"
          }
          alt="Banner 5"
          className="banner-small"
          onError={(e) =>
            ((e.currentTarget as HTMLImageElement).src =
              "https://n7media.coolmate.me/uploads/June2025/women.jpg?aio=w-1069")
          }
        />
      </section>

      {/* Banner lớn 1 (DB id=4) */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src={bigBanners[0] || fallbackUrls[0]}
          alt="Banner 6"
          onError={(e) => onImgError(e, 0)}
        />
      </section>

      {/* Banner lớn 2 (DB id=5) */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src={bigBanners[1] || fallbackUrls[1]}
          alt="Banner 7"
          onError={(e) => onImgError(e, 1)}
        />
      </section>

      {/* Banner lớn 3 (DB id=6) */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src={bigBanners[2] || fallbackUrls[2]}
          alt="Banner 8"
          onError={(e) => onImgError(e, 2)}
        />
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-item">
          <div className="icon">
            <i className="fas fa-shipping-fast" />
          </div>
          <h3>Free Shipping</h3>
          <p>Miễn phí vận chuyển cho đơn hàng trên 500k</p>
        </div>
        <div className="feature-item">
          <div className="icon">
            <i className="fas fa-lock" />
          </div>
          <h3>Secure Payment</h3>
          <p>Thanh toán an toàn, bảo mật 100%</p>
        </div>
        <div className="feature-item">
          <div className="icon">
            <i className="fas fa-headset" />
          </div>
          <h3>24/7 Support</h3>
          <p>Hỗ trợ khách hàng mọi lúc mọi nơi</p>
        </div>
        <div className="feature-item">
          <div className="icon">
            <i className="fas fa-undo" />
          </div>
          <h3>Easy Returns</h3>
          <p>Đổi trả dễ dàng trong 30 ngày</p>
        </div>
      </section>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
    </main>
  );
};

export default HomePage;
