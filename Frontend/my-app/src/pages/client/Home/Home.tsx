import "../../../assets/styles/mess-fb-phone.css";
import "../../../assets/styles/home.css";
import Slideshow from "../../../components/SlideShow";
import TopProductsSection from "./TopProductsSection";
import ProductSection from "./ProductSection";
import { useHomeSection } from "../../../hook/useHomeSection";

const HomePage = () => {
    const { sections = [], loading, error } = useHomeSection();

  if (loading) {
    return (
      <main>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div>Đang tải...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <div>Lỗi: {error}</div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Slideshow />
      <TopProductsSection />
      
      {/* Render các sections từ database */}
      {sections.map((section, index) => (
        <div key={section.id}>
          {/* Product Section */}
          {section.products && section.products.length > 0 && (
            <ProductSection 
              title={section.title} 
              products={section.products}
            />
          )}
          
          {/* Banner sections - hiển thị banner xen kẽ */}
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
              <img
                src="https://deltasport.vn/wp-content/uploads/2025/05/swimwear.png"
                alt="Banner lớn 1"
              />
            </section>
          )}
          
          {index === 2 && (
            <section className="single-banner" data-aos="fade-up">
              <img
                src="https://deltasport.vn/wp-content/uploads/2025/05/racquet.png"
                alt="Banner lớn 2"
              />
            </section>
          )}
          
          {index === 3 && (
            <section className="single-banner" data-aos="fade-up">
              <img
                src="https://deltasport.vn/wp-content/uploads/2025/05/running.png"
                alt="Banner lớn 3"
              />
            </section>
          )}
        </div>
      ))}
<div>
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
  {/* Font Awesome */}
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</div>

    </main>
  );
};

export default HomePage; 