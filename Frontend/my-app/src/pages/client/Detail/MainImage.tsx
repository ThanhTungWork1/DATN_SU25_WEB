import "../../../assets/styles/mainImage.css";

type MainImageProps = {
  imageUrl: string;
};

const MainImage = ({ imageUrl }: MainImageProps) => {
  return (
    <div className="main-image-container">
      <img
        src={imageUrl}
        alt="Main Product"
        className="main-image"
      />
    </div>
  );
};

export default MainImage;
