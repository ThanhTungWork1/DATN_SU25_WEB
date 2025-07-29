import { useEffect } from "react";
import "../../../assets/styles/mess-fb-phone.css";
import "../../../assets/styles/home.css";
import Slideshow from "../../../components/SlideShow";
import TopProductsSection from './TopProductsSection';
import ProductSection from "./ProductSection";
const HomePage = () => {

  return (
    <main>
      <Slideshow />
        <TopProductsSection />
      {/* Gợi ý hôm nay */}
      <ProductSection
        title="Gợi ý hôm nay"
        apiUrl="/top-selling-products"
      />


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
          src="https://deltasport.vn/wp-content/uploads/2025/05/swimwear.png"
          alt="Banner lớn 1"
        />
      </section>

      {/* BST Xuân Hè */}
      <ProductSection
        title="BST xuân hè 2025"
        apiUrl="/top-selling-products"
      />

      {/* Banner to 2 */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src="https://deltasport.vn/wp-content/uploads/2025/05/racquet.png"
          alt="Banner lớn 2"
        />
      </section>

      {/* Bán chạy tuần này */}
      <ProductSection title="Top bán chạy" apiUrl="/top-selling-products" />

      {/* Banner to 3 */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src="https://deltasport.vn/wp-content/uploads/2025/05/running.png"
          alt="Banner lớn 3"
        />
      </section>
    </main>
  );
};

export default HomePage;