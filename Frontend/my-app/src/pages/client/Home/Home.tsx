// import { useEffect } from "react";
// <<<<<<< HEAD
// import AOS from "aos";
// import "aos/dist/aos.css";
// import "../../../assets/styles/mess-fb-phone.css";
// import "../../../assets/styles/home.css";
// import Slideshow from "../../../components/SlideShow";

// const HomePage = () => {
//   useEffect(() => {
//     AOS.init({
//       duration: 800,
//       once: true,
//     });
//   }, []);
// =======
// import "../../../assets/styles/mess-fb-phone.css";
// import "../../../assets/styles/home.css";
// import Slideshow from "../../../components/SlideShow";
// import TopProductsSection from './TopProductsSection';
// import ProductSection from "./ProductSection";
// const HomePage = () => {
// >>>>>>> origin/ThanhTung_profile_home_auth

//   return (
//     <main>
//       <Slideshow />
// <<<<<<< HEAD

//       {/* Topic Block */}
//       <div className="topic-block" data-aos="fade-up">
//         {[
//           "Áo Polo",
//           "Quần Short",
//           "Áo Thun",
//           "Quần Jeans",
//           "Giày Thể Thao",
//           "Phụ Kiện",
//           "Áo Khoác",
//         ].map((topic, index) => (
//           <button
//             key={index}
//             className={`topic ${index === 0 ? "active" : ""}`}
//           >
//             {topic}
//           </button>
//         ))}
//       </div>

//       {/* Gợi ý hôm nay */}
//       <section className="fashion-section" data-aos="fade-up">
//         <div className="fashion-head">
//           <h2>Gợi ý hôm nay</h2>
//           <a href="#" className="view-all">
//             Xem tất cả
//           </a>
//         </div>
//         <div className="fashion-row">
//           {[...Array(4)].map((_, index) => (
//             <div className="fashion-card" key={index} data-aos="zoom-in">
//               <span className="fashion-badge">-15%</span>
//               <img
//                 className="fashion-img"
//                 src="https://1557691689.e.cdneverest.net/fast/747x0/filters:format(webp)/static.5sfashion.vn/storage/product/aXFBXT8hi3N81ah7VoMZwV2OJYa3dfZs_cover.jpg"
//                 alt="Áo Polo Nam 5S"
//               />
//               <div className="fashion-name">
//                 Áo Polo Nam 5S Fashion Can Phối Phom Slimfit
//               </div>
//               <div>
//                 <span className="fashion-price">339.150đ</span>
//                 <span className="fashion-oldprice">399.000đ</span>
//               </div>
//               <div className="fashion-rate">25 sản phẩm đã bán</div>
//               <button className="fashion-buy">Xem Ngay</button>
//             </div>
//           ))}
//         </div>
//       </section>
// =======
//         <TopProductsSection />
//       {/* Gợi ý hôm nay */}
//       <ProductSection
//         title="Gợi ý hôm nay"
//         apiUrl="/top-selling-products"
//       />

// >>>>>>> origin/ThanhTung_profile_home_auth

//       {/* 2 banner vuông */}
//       <section className="double-banner" data-aos="fade-up">
//         <img
//           src="https://n7media.coolmate.me/uploads/June2025/men_84.jpg?aio=w-1069"
//           alt="Banner 1"
//           className="banner-small"
//         />
//         <img
//           src="https://n7media.coolmate.me/uploads/June2025/women.jpg?aio=w-1069"
//           alt="Banner 2"
//           className="banner-small"
//         />
//       </section>

//       {/* Banner to 1 */}
//       <section className="single-banner" data-aos="fade-up">
//         <img
//           src="https://deltasport.vn/wp-content/uploads/2025/05/swimwear.png"
//           alt="Banner lớn 1"
//         />
//       </section>

//       {/* BST Xuân Hè */}
// <<<<<<< HEAD
//       <section className="fashion-section" data-aos="fade-up">
//         <div className="fashion-head">
//           <h2>BST xuân hè 2025</h2>
//           <a href="#" className="view-all">
//             Xem tất cả
//           </a>
//         </div>
//         <div className="fashion-row">
//           {[...Array(4)].map((_, index) => (
//             <div className="fashion-card" key={index} data-aos="zoom-in">
//               <span className="fashion-badge">-15%</span>
//               <img
//                 className="fashion-img"
//                 src="https://1557691689.e.cdneverest.net/fast/747x0/filters:format(webp)/static.5sfashion.vn/storage/product/aXFBXT8hi3N81ah7VoMZwV2OJYa3dfZs_cover.jpg"
//                 alt="Áo Polo Nam 5S"
//               />
//               <div className="fashion-name">
//                 Áo Polo Nam 5S Fashion Can Phối Phom Slimfit
//               </div>
//               <div>
//                 <span className="fashion-price">339.150đ</span>
//                 <span className="fashion-oldprice">399.000đ</span>
//               </div>
//               <div className="fashion-rate">25 sản phẩm đã bán</div>
//               <button className="fashion-buy">Xem Ngay</button>
//             </div>
//           ))}
//         </div>
//       </section>
// =======
//       <ProductSection
//         title="BST xuân hè 2025"
//         apiUrl="/top-selling-products"
//       />
// >>>>>>> origin/ThanhTung_profile_home_auth

//       {/* Banner to 2 */}
//       <section className="single-banner" data-aos="fade-up">
//         <img
//           src="https://deltasport.vn/wp-content/uploads/2025/05/racquet.png"
//           alt="Banner lớn 2"
//         />
//       </section>

//       {/* Bán chạy tuần này */}
// <<<<<<< HEAD
//       <section className="fashion-section" data-aos="fade-up">
//         <div className="fashion-head">
//           <h2>Bán chạy tuần này</h2>
//           <a href="#" className="view-all">
//             Xem tất cả
//           </a>
//         </div>
//         <div className="fashion-row">
//           {[...Array(4)].map((_, index) => (
//             <div className="fashion-card" key={index} data-aos="zoom-in">
//               <span className="fashion-badge">-15%</span>
//               <img
//                 className="fashion-img"
//                 src="https://1557691689.e.cdneverest.net/fast/747x0/filters:format(webp)/static.5sfashion.vn/storage/product/aXFBXT8hi3N81ah7VoMZwV2OJYa3dfZs_cover.jpg"
//                 alt="Áo Polo Nam 5S"
//               />
//               <div className="fashion-name">
//                 Áo Polo Nam 5S Fashion Can Phối Phom Slimfit
//               </div>
//               <div>
//                 <span className="fashion-price">339.150đ</span>
//                 <span className="fashion-oldprice">399.000đ</span>
//               </div>
//               <div className="fashion-rate">25 sản phẩm đã bán</div>
//               <button className="fashion-buy">Xem Ngay</button>
//             </div>
//           ))}
//         </div>
//       </section>
// =======
//       <ProductSection title="Top bán chạy" apiUrl="/top-selling-products" />
// >>>>>>> origin/ThanhTung_profile_home_auth

//       {/* Banner to 3 */}
//       <section className="single-banner" data-aos="fade-up">
//         <img
//           src="https://deltasport.vn/wp-content/uploads/2025/05/running.png"
//           alt="Banner lớn 3"
//         />
//       </section>
//     </main>
//   );
// };

// <<<<<<< HEAD
// export default HomePage;
// =======
// export default HomePage;
// >>>>>>> origin/ThanhTung_profile_home_auth

import "../../../assets/styles/mess-fb-phone.css";
import "../../../assets/styles/home.css";
import Slideshow from "../../../components/SlideShow";
import TopProductsSection from "./TopProductsSection";
import ProductSection from "./ProductSection";
import { useEffect, useState } from "react";
import publicAxios from "../../../utils/publicAxios";
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

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await publicAxios.get<{ data: { id: number; image_url: string; status: boolean; public_id?: string }[] }>(
          `/banners?t=${Date.now()}`
        );
        // Lấy theo thứ tự trả về (đã orderBy id ở backend)
        const active = (res.data?.data || [])
          .filter((b) => b.status)
          .sort((a, b) => a.id - b.id);

        const toUrl = (u?: string) =>
          u ? `${u}${u.includes("?") ? "&" : "?"}t=${Date.now()}` : "";

        const smallUrls = [toUrl(active[0]?.image_url), toUrl(active[1]?.image_url)];
        const bigUrls = [toUrl(active[2]?.image_url), toUrl(active[3]?.image_url), toUrl(active[4]?.image_url)];
        console.debug("[Home] small URLs (first 2 active):", smallUrls);
        console.debug("[Home] big URLs (next 3 active):", bigUrls);

        if (mounted) {
          setSmallBanners(smallUrls);
          setBigBanners(bigUrls);
        }
      } catch (e) {
        // giữ fallback khi lỗi
        console.warn("[Home] load banners error", e);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main>
      <Slideshow />
      <TopProductsSection />
      {/* Gợi ý hôm nay */}
      <ProductSection title="Gợi ý hôm nay" apiUrl="/top-selling-products" />

      {/* 2 banner vuông */}
      <section className="double-banner" data-aos="fade-up">
        <img
          src={
            smallBanners[0] ||
            "https://n7media.coolmate.me/uploads/June2025/men_84.jpg?aio=w-1069"
          }
          alt="Banner 4"
          className="banner-small"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://n7media.coolmate.me/uploads/June2025/men_84.jpg?aio=w-1069";
          }}
        />
        <img
          src={
            smallBanners[1] ||
            "https://n7media.coolmate.me/uploads/June2025/women.jpg?aio=w-1069"
          }
          alt="Banner 5"
          className="banner-small"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://n7media.coolmate.me/uploads/June2025/women.jpg?aio=w-1069";
          }}
        />
      </section>

      {/* Banner to 1 (DB id=4) */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src={bigBanners[0] || fallbackUrls[0]}
          alt="Banner 6"
          onError={(e) => onImgError(e, 0)}
        />
      </section>

      {/* BST Xuân Hè */}
      <ProductSection title="BST xuân hè 2025" apiUrl="/top-selling-products" />

      {/* Banner to 2 (DB id=5) */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src={bigBanners[1] || fallbackUrls[1]}
          alt="Banner 7"
          onError={(e) => onImgError(e, 1)}
        />
      </section>

      {/* Bán chạy tuần này */}
      <ProductSection title="Top bán chạy" apiUrl="/top-selling-products" />

      {/* Banner to 3 (DB id=6) */}
      <section className="single-banner" data-aos="fade-up">
        <img
          src={bigBanners[2] || fallbackUrls[2]}
          alt="Banner 8"
          onError={(e) => onImgError(e, 2)}
        />
      </section>
    </main>
  );
};

export default HomePage;
