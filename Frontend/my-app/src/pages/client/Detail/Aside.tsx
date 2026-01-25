// src/components/Aside.tsx
import "../../../assets/styles/aside.css";

type AsideProps = {
  images: string[];
  onSelect: (img: string) => void;
  selectedImage: string | null; // Cho phép selectedImage có thể là null
};

import { getImageUrl } from "../../../utils/imageUtils";

const Aside = ({ images, onSelect, selectedImage }: AsideProps) => {
  const createFullUrl = (url: string) => {
    return getImageUrl(url);
  };

  return (
    <div className="aside-thumbnails">
      {images.map((img, idx) => {
        const fullImageUrl = createFullUrl(img);
        const isSelected = selectedImage && createFullUrl(selectedImage) === fullImageUrl;

        return (
          <img
            key={idx}
            src={fullImageUrl} 
            alt={`thumb-${idx}`}
            onClick={() => onSelect(img)} 
            className={isSelected ? "thumbnail-img selected" : "thumbnail-img"}
          />
        );
      })}
    </div>
  );
};

export default Aside;
