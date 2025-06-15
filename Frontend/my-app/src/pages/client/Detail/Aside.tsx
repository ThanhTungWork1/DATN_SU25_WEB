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
    return (
        <div className="thumbnail-list">
            <img
                src="https://tse3.mm.bing.net/th?id=OIP.FEa-cOO8qehce6lOIOQGlwHaHa&pid=Api&P=0&h=180"
                className="img-fluid"
            />
            <img
                src="https://tse4.mm.bing.net/th?id=OIP.7ZxepcJaDNoUZqs3JZPxKwHaHa&pid=Api&P=0&h=180"
                className="img-fluid"
            />
            <img
                src="https://tse4.mm.bing.net/th?id=OIP.7ZxepcJaDNoUZqs3JZPxKwHaHa&pid=Api&P=0&h=180"
                className="img-fluid"
            />
            <img
                src="https://tse3.mm.bing.net/th?id=OIP.FEa-cOO8qehce6lOIOQGlwHaHa&pid=Api&P=0&h=180"
                className="img-fluid"
            />
            <img
                src="https://tse3.mm.bing.net/th?id=OIP.FEa-cOO8qehce6lOIOQGlwHaHa&pid=Api&P=0&h=180"
                className="img-fluid"
            />
        </div>
    );
};

>>>>>>> 6a994c6e (giao dien detail)

export default Aside;
