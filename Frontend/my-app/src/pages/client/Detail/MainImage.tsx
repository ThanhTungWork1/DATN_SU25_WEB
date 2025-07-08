type MainImageProps = {
  imageUrl: string;
};

const MainImage = ({ imageUrl }: MainImageProps) => {
  return (
    // hiển thị ảnh chi tiết sp
    <div className="product-main-image-wrapper">
      <img src={imageUrl} alt="Main Product" className="product-main-image" />
    </div>
  );
};

export default MainImage;
