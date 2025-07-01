import { useState } from 'react';

export const BoxProduc = () => {
  const [liked, setLiked] = useState(false);

  return (
    <>
      <div className="col">
        <div className="card">
          <div className="position-relative">
            <span className="badge bg-warning position-absolute top-0 start-0">
              Giảm 10%
            </span>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz-vV-cEda54gIp3uJbhWOl5FZv-sIj3fI-w&s"
              className="card-img-top"
              alt="Áo thun"
            />
          </div>
          <div className="card-body">
            <h5 className="card-title">Áo Thun Nữ Cotton thời trang sang trọng đúng trend 2025</h5>
            <p className="product-price">
              <span className="sale-price">159.000đ</span>
              <span className="original-price">318.000đ</span>
            </p>
            <div className="button-group">
              <button className="btn btn-primary btn-sm">+ Giỏ hàng</button>
              <button className="btn btn-danger btn-sm">Mua ngay</button>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <span className="sold-text">Đã bán 123</span>
              <button
                className="btn btn-link p-0 m-0"
                style={{ color: liked ? '#e63946' : '#bbb' }}
                title="Yêu thích"
                onClick={() => setLiked(l => !l)}
              >
                <i className={liked ? "fas fa-heart" : "far fa-heart"}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
