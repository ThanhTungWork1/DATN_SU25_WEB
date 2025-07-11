import { useEffect, useState } from "react";
import { getBanners } from "../api/ApiBanner";
import type { Banner } from "../types/BannerType";

export const Section = () => {
  const [bannerUrl, setBannerUrl] = useState<string>("");

  useEffect(() => {
    getBanners()
      .then((data: Banner[]) => {
        if (Array.isArray(data) && data.length > 0 && data[0].image_url) {
          setBannerUrl(data[0].image_url);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="banner-outer">
      <section className="banner">
        <div className="banner-info">
          <h1>Bộ Sưu Tập Quần Áo Mới</h1>
          <p>
            Khám phá những xu hướng thời trang mới nhất, chất liệu thoáng mát,
            thiết kế hiện đại phù hợp cho mọi lứa tuổi. Ưu đãi giảm giá lên đến
            30% cho các sản phẩm hot nhất!
          </p>
          <button className="banner-btn">Xem ngay</button>
        </div>
        <img
          className="banner-img"
          src={
            bannerUrl ||
            "https://1557691689.e.cdneverest.net/fast/747x0/filters:format(webp)/static.5sfashion.vn/storage/product/CcnQdpiJAgHxf3wEB4JiQ5lXtngat92T_cover.jpg"
          }
          alt="Banner Quần Áo"
        />
      </section>
    </div>
  );
};
