<<<<<<< HEAD
<<<<<<< HEAD
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
=======
const MainImage = () => {
=======
type MainImageProps = {
  imageUrl: string;
};

const MainImage = ({ imageUrl }: MainImageProps) => {
<<<<<<< HEAD
>>>>>>> f51a0d77 (trang detail hoan thien)
    return (
        // hiển thị ảnh hi tiết sp
        <div className="text-center">
            <img src={imageUrl} alt="Main Product" style={{ width: "100%", maxHeight: 500, objectFit: "contain" }} />
        </div>
    );
>>>>>>> 6a994c6e (giao dien detail)
=======
  return (
    // hiển thị ảnh hi tiết sp
    <div className="text-center">
      <img
        src={imageUrl}
        alt="Main Product"
        style={{ width: "100%", maxHeight: 500, objectFit: "contain" }}
      />
    </div>
  );
>>>>>>> a8244187 (giao dien list sp)
};

export default MainImage;
