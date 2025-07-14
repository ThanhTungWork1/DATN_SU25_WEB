import React from "react";
import type { BannerProps } from "../types/BannerType";

/**
 * Banner quảng cáo giữa trang detail
 */
const Banner: React.FC<BannerProps> = ({
  imageUrl,
  alt = "Banner quảng cáo",
}) => {
  return (
    <div className="banner-detail-image-wrapper">
      <img src={imageUrl} alt={alt} className="banner-detail-image" />
    </div>
  );
};

export default Banner;
