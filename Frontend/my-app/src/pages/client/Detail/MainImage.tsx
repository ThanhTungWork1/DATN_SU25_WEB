type MainImageProps = {
    imageUrl: string;
};

const MainImage = ({ imageUrl }: MainImageProps) => {
    return (
        // hiển thị ảnh hi tiết sp
        <div className="text-center">
            <img src={imageUrl} alt="Main Product" style={{ width: "100%", maxHeight: 500, objectFit: "contain" }} />
        </div>
    );
};

export default MainImage;
