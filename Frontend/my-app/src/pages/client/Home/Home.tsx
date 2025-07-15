import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../../assets/styles/mess-fb-phone.css";
import "../../../assets/styles/home.css";
import Slideshow from "../../../components/SlideShow";

const HomePage = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <main>
      <Slideshow />

      {/* Topic Block */}
      <div className="topic-block" data-aos="fade-up">
        {[
          "Áo Polo",
          "Quần Short",
          "Áo Thun",
          "Quần Jeans",
          "Giày Thể Thao",
          "Phụ Kiện",
          "Áo Khoác",
        ].map((topic, index) => (
          <button
            key={index}
            className={`topic ${index === 0 ? "active" : ""}`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Gợi ý hôm nay */}
      <section className="fashion-section" data-aos="fade-up">
        <div className="fashion-head">
          <h2>Gợi ý hôm nay</h2>
          <a href="#" className="view-all">
            Xem tất cả
          </a>
        </div>
        <div className="fashion-row">
          {[...Array(4)].map((_, index) => (
            <div className="fashion-card" key={index} data-aos="zoom-in">
              <span className="fashion-badge">-15%</span>
              <img
                className="fashion-img"
                src="https://1557691689.e.cdneverest.net/fast/747x0/filters:format(webp)/static.5sfashion.vn/storage/product/aXFBXT8hi3N81ah7VoMZwV2OJYa3dfZs_cover.jpg"
                alt="Áo Polo Nam 5S"
              />
              <div className="fashion-name">
                Áo Polo Nam 5S Fashion Can Phối Phom Slimfit
              </div>
              <div>
                <span className="fashion-price">339.150đ</span>
                <span className="fashion-oldprice">399.000đ</span>
              </div>
              <div className="fashion-rate">25 sản phẩm đã bán</div>
              <button className="fashion-buy">Mua để nhận quà</button>
            </div>
          ))}
        </div>
      </section>

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
      <section className="fashion-section" data-aos="fade-up">
        <div className="fashion-head">
          <h2>BST xuân hè 2025</h2>
          <a href="#" className="view-all">
            Xem tất cả
          </a>
        </div>
        <div className="fashion-row">
          {[...Array(4)].map((_, index) => (
            <div className="fashion-card" key={index} data-aos="zoom-in">
              <span className="fashion-badge">-15%</span>
              <img
                className="fashion-img"
                src="https://1557691689.e.cdneverest.net/fast/747x0/filters:format(webp)/static.5sfashion.vn/storage/product/aXFBXT8hi3N81ah7VoMZwV2OJYa3dfZs_cover.jpg"
                alt="Áo Polo Nam 5S"
              />
              <div className="fashion-name">
                Áo Polo Nam 5S Fashion Can Phối Phom Slimfit
              </div>
              {/* <div className="fashion-meta">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/616/616490.png"
                  width="16"
                  height="16"
                  style={{ verticalAlign: "middle" }}
                />{" "}
                5/5
              </div> */}
              <div>
                <span className="fashion-price">339.150đ</span>
                <span className="fashion-oldprice">399.000đ</span>
              </div>
              <div className="fashion-rate">25 sản phẩm đã bán</div>
              <button className="fashion-buy">Mua để nhận quà</button>
            </div>
          ))}
        </div>
      </section>

      {/* Banner to 2 */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src="https://deltasport.vn/wp-content/uploads/2025/05/racquet.png"
          alt="Banner lớn 2"
        />
      </section>

      {/* Bán chạy tuần này */}
      <section className="fashion-section" data-aos="fade-up">
        <div className="fashion-head">
          <h2>Bán chạy tuần này</h2>
          <a href="#" className="view-all">
            Xem tất cả
          </a>
        </div>
        <div className="fashion-row">
          {[...Array(4)].map((_, index) => (
            <div className="fashion-card" key={index} data-aos="zoom-in">
              <span className="fashion-badge">-15%</span>
              <img
                className="fashion-img"
                src="https://1557691689.e.cdneverest.net/fast/747x0/filters:format(webp)/static.5sfashion.vn/storage/product/aXFBXT8hi3N81ah7VoMZwV2OJYa3dfZs_cover.jpg"
                alt="Áo Polo Nam 5S"
              />
              <div className="fashion-name">
                Áo Polo Nam 5S Fashion Can Phối Phom Slimfit
              </div>
              {/* <div className="fashion-meta">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/616/616490.png"
                  width="16"
                  height="16"
                  style={{ verticalAlign: "middle" }}
                />{" "}
                5/5
              </div> */}
              <div>
                <span className="fashion-price">339.150đ</span>
                <span className="fashion-oldprice">399.000đ</span>
              </div>
              <div className="fashion-rate">25 sản phẩm đã bán</div>
              <button className="fashion-buy">Mua để nhận quà</button>
            </div>
          ))}
        </div>
      </section>

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
