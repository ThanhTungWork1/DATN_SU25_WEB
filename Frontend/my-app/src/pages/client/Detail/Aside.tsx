// src/components/Aside.tsx
import "../../../assets/styles/aside.css";

type AsideProps = {
  images: string[];
  onSelect: (img: string) => void;
  selectedImage: string;
};

const Aside = ({ images, onSelect, selectedImage }: AsideProps) => {
  return (
    <div className="aside-thumbnails">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`thumb-${idx}`}
          onClick={() => onSelect(img)}
          className={
            img === selectedImage ? "thumbnail-img selected" : "thumbnail-img"
          }
        />
      ))}
    </div>
  );
};

export default Aside;
