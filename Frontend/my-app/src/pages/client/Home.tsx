import { Section } from "../../components/Section";
import "../../layouts/Client/Home.css";
const HomePage = () => {
  return (
    <main>
      {/* Banner Section */}
      <Section />
      {/* Topic Block */}
      <div className="topic-block">
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

      {/* Fashion Section */}
      <section className="fashion-section">
        <div className="fashion-head">
          <h2>BST Xuân Hè 2025</h2>
          <a href="#" className="view-all">
            Xem tất cả
          </a>
        </div>
        <div className="fashion-row">
          {[...Array(4)].map((_, index) => (
            <div className="fashion-card" key={index}>
              <span className="fashion-badge">-15%</span>
              <img
                className="fashion-img"
                src="https://1557691689.e.cdneverest.net/fast/747x0/filters:format(webp)/static.5sfashion.vn/storage/product/aXFBXT8hi3N81ah7VoMZwV2OJYa3dfZs_cover.jpg"
                alt="Áo Polo Nam 5S"
              />
              <div className="fashion-name">
                Áo Polo Nam 5S Fashion Can Phối Phom Slimfit
              </div>
              <div className="fashion-meta">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/616/616490.png"
                  width="16"
                  height="16"
                  style={{ verticalAlign: "middle" }}
                />{" "}
                5/5
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
    </main>
  );
};

export default HomePage;
