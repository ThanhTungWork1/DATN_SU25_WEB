import "../../../assets/styles/mainImage.css";

type MainImageProps = {
  imageUrl: string;
};

/**
 * Banner quảng cáo giữa trang detail
 */
const Banner: React.FC<BannerProps> = ({
  imageUrl,
  alt = "Banner quảng cáo",
}) => {
  return (
    <div className="main-image-container">
      <img src={imageUrl} alt="Main Product" className="main-image" />
    </div>
  );
};

export default Banner;
