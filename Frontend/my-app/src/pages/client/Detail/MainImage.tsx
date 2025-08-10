import "../../../assets/styles/mainImage.css";
import { getImageUrl } from "../../../utils/imageUtils";

type MainImageProps = {
  imageUrl: string | null; // Cho phép imageUrl có thể là null
};

/**
 * Component hiển thị ảnh chính của sản phẩm
 */
const MainImage: React.FC<MainImageProps> = ({ imageUrl }) => {
  // Nếu không có imageUrl, hiển thị placeholder
  if (!imageUrl) {
    return (
      <div className="main-image-container">
        <div className="main-image placeholder-image">
          <span>Ảnh không có sẵn</span>
        </div>
      </div>
    );
  }

  // Sử dụng utility function để tạo URL
  const fullImageUrl = getImageUrl(imageUrl);

  return (
    <div className="main-image-container">
      <img src={fullImageUrl} alt="Main Product" className="main-image" />
    </div>
  );
};

export default MainImage;
