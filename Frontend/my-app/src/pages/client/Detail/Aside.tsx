
import "../../../assets/styles/detailProduct.css";

type AsideProps = {
  images: string[];
  onSelect: (img: string) => void;
  selectedImage: string;
};

const Aside = ({ images, onSelect, selectedImage }: AsideProps) => {
  return (
    <div className="thumbnail-list">
      {/* hiển thị ảnh và click ảnh hiển thị ra */}
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`thumb-${idx}`}
          onClick={() => onSelect(img)}
          className={img === selectedImage ? "selected" : ""}
        />
      ))}
    </div>
  );
};

  return (
    <div className="thumbnail-list">
      {/* hiển thị ảnh và click ảnh hiển thị ra */}
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`thumb-${idx}`}
          onClick={() => onSelect(img)}
          className={img === selectedImage ? "selected" : ""}
        />
      ))}
    </div>
  );

export default Aside;
