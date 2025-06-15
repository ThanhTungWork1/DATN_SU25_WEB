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
    return (
        <div className="product-image w-100">
            <img
                src="https://tse3.mm.bing.net/th?id=OIP.GOMpePRjUIIFgc7gCH7_UgHaHa&pid=Api&P=0"
                alt="Main Product"
                className="img-fluid"
            />
        </div>
    );
>>>>>>> 6a994c6e (giao dien detail)
};

export default MainImage;
