import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../../assets/styles/mess-fb-phone.css";
import "../../../assets/styles/home.css";
import Slideshow from "../../../components/SlideShow";
import TopProductsSection from "./TopProductsSection";
import ProductSection from "./ProductSection";

const HomePage = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <main>
      <Slideshow />
      <TopProductsSection />
      {/* Gợi ý hôm nay */}
      <ProductSection title="Gợi ý hôm nay" apiUrl="/top-selling-products" />
      {/* Sản phẩm mới */}
      <ProductSection title="Sản phẩm mới" apiUrl="/featured-products" />
      {/* Sản phẩm bán chạy */}
      <ProductSection title="Bán chạy nhất" apiUrl="/best-selling-products" />
    </main>
  );
};

export default HomePage;
