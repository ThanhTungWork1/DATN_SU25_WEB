import "../../../assets/styles/mess-fb-phone.css";
import "../../../assets/styles/home.css";
import Slideshow from "../../../components/SlideShow";
import TopProductsSection from "./TopProductsSection";
import ProductSection from "./ProductSection";
import { useState, useEffect } from "react";
import { Banner } from "../../../types/BannerType";

const HomePage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/banners');
        const result = await response.json();
        const activeBanners = (result.data || []).filter((banner: Banner) => banner.status);
        setBanners(activeBanners);
      } catch (error) {
        console.error('Error loading banners:', error);
      }
    };

    fetchBanners();
  }, []);

  // Helper function to get banner by index or fallback
  const getBannerImage = (index: number, fallbackUrl: string) => {
    return banners[index]?.image_url || fallbackUrl;
  };

  return (
    <main>
      <Slideshow />
      <TopProductsSection />
      {/* Gợi ý hôm nay */}
      <ProductSection title="Gợi ý hôm nay" apiUrl="/top-selling-products" />

      {/* 2 banner vuông */}
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

      {/* Banner to 1 */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src={getBannerImage(0, "https://deltasport.vn/wp-content/uploads/2025/05/swimwear.png")}
          alt="Banner lớn 1"
        />
      </section>

      {/* BST Xuân Hè */}
      <ProductSection title="BST xuân hè 2025" apiUrl="/top-selling-products" />

      {/* Banner to 2 */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src={getBannerImage(1, "https://deltasport.vn/wp-content/uploads/2025/05/racquet.png")}
          alt="Banner lớn 2"
        />
      </section>

      {/* Bán chạy tuần này */}
      <ProductSection title="Top bán chạy" apiUrl="/top-selling-products" />

      {/* Banner to 3 */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src={getBannerImage(2, "https://deltasport.vn/wp-content/uploads/2025/05/running.png")}
          alt="Banner lớn 3"
        />
      </section>
    </main>
  );
};

export default HomePage;
