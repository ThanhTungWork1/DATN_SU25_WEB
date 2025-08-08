import "../../../assets/styles/mainImage.css";

type MainImageProps = {
  imageUrl: string;
};

/**
 * Component hiển thị ảnh chính của sản phẩm
 */
const MainImage: React.FC<MainImageProps> = ({ imageUrl }) => {
  return (
    <div className="main-image-container">
      <img src={imageUrl} alt="Main Product" className="main-image" />
    </div>
  );
};

export default MainImage;
