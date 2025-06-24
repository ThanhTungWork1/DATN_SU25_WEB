import { useEffect, useState } from "react";

const banners = [
  "https://i.pinimg.com/originals/df/30/cb/df30cb36898b47637df11655015350dc.png",
  "https://im.uniqlo.com/global-cms/spa/res140e0d36854faaeb7edff1a21493ce89fr.jpg",
  "https://th.bing.com/th/id/R.2232008e8eeaddc63c57e968faa3e24e?rik=KVQLXjWdxuhfmw&pid=ImgRaw&r=0"
];

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000); // Chuyển ảnh mỗi 3 giây

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="bannerCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner" style={{ maxHeight: "500px" }}>
        {banners.map((src, index) => (
          <div key={index} className={`carousel-item ${index === currentIndex ? "active" : ""}`}>
            <img
              src={src}
              className="d-block w-100"
              alt={`Banner ${index + 1}`}
              style={{ height: "500px", objectFit: "cover", borderRadius: "10px" }}
            />
          </div>
        ))}
      </div>
      <button className="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
      </button>
    </div>
  );
};

export default Banner;
