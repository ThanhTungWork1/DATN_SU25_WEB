

const Footer = () => {
    return (
        <>
            <div className="footer mt-5">
                <div className="container">
                    <div className="row">
                        <div className="col-md-3">
                            <h6>Furniro</h6>
                            <p>400 University Drive Suite 200 Coral Gables, FL 33134 USA</p>
                        </div>

                        <div className="col-md-3">
                            <h6>Danh sách</h6>
                            <ul className="list-unstyled">
                                <li><a href="#">Trang chủ</a></li>
                                <li><a href="#">Cửa hàng</a></li>
                                <li><a href="#">About</a></li>
                                <li><a href="#">Liên hệ</a></li>
                            </ul>
                        </div>

                        <div className="col-md-3">
                            <h6>Giúp đỡ</h6>
                            <ul className="list-unstyled">
                                <li><a href="#">LỰa chọn thanh toán</a></li>
                                <li><a href="#">Trả lại</a></li>
                                <li><a href="#">Chính sách bảo mật</a></li>
                            </ul>
                        </div>

                        <div className="col-md-3">
                            <h6>Vị trí</h6>
                            <p>
                                example@email.com<br />
                                +84 123 456 789<br />
                                District 1, HCMC
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;
