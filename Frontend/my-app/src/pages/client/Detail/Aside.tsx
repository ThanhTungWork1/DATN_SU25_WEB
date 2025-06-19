<<<<<<< HEAD
<<<<<<< HEAD
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
=======
const Aside = () => {
=======
import '../../../assets/styles/detailProduct.css';

type AsideProps = {
    images: string[];
    onSelect: (img: string) => void;
    selectedImage: string;
};

const Aside = ({ images, onSelect, selectedImage }: AsideProps) => {
>>>>>>> f51a0d77 (trang detail hoan thien)
    return (
        <div className="thumbnail-list">
            {/* hiển thị ảnh và click ảnh hiển thị ra */}
            {images.map((img, idx) => (
                <img
                    key={idx}
                    src={img}
                    alt={`thumb-${idx}`}
                    onClick={() => onSelect(img)}
                    className={img === selectedImage ? 'selected' : ''}
                />
            ))}
        </div>
    );
};

<<<<<<< HEAD
>>>>>>> 6a994c6e (giao dien detail)

=======
>>>>>>> f51a0d77 (trang detail hoan thien)
export default Aside;
