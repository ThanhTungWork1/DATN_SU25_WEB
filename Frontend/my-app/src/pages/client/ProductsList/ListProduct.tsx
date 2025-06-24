
import { FilteProducts } from "./FilteProducts";
import { SerchProducts } from "./SerchProducts";
import { BoxProduc } from "../../../components/BoxProduc";
import '../../../assets/styles/ListProducts.css';
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Pagination } from "./Pagination";

export const ListProduct = () => {
  // Mẫu danh sách sản phẩm (có thể thay bằng props hoặc fetch API)
  const products = Array(30).fill({}); // tạo 12 sản phẩm mẫu

    return (
    <>
    <Navbar/>
    {/* bộ lọc sp */}
     <div className="offcanvas offcanvas-start border-end" data-bs-scroll="true" data-bs-backdrop="false" tabIndex={-1}  id="offcanvasFilter">
      <FilteProducts/>
     </div>
      {/* Thanh tìm kiếm và nút lọc ngang hàng  */}
  <div className="container my-4">
    {/* bộ lọc - tìm kiếm sp */}
       <SerchProducts />
    <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-4">
      {products.map((_, index) => (
            <BoxProduc key={index} />
          ))}
          {/* phân trang sp */}
          <Pagination/>
    </div>
  </div>
  <Footer/>
    </>
  )
};