
// Import các component con
import Navbar from '../../../components/Navbar';
import Aside from './Aside';
import MainImage from './MainImage';
import ProductInfo from './ProductInfo';
import Size from './Size';
import Color from '../../../components/Color';
import ProductActions from '../../../components/ProductActions';
import ProductMeta from './ProductMeta';
import ContentTabs from './ContentTabs';
import ProductTabs from './ProductTabs';
import RelatedProducts from './RelatedProducts';
import Footer from '../../../components/Footer';
import "../../../assets/styles/detailProduct.css";

const ProductDetail = () => {
    return (
        <>
            <Navbar />

            <div className="container py-5">
                <div className="row g-4">
                    {/* Sidebar left */}
                    <div className="col-lg-2 col-md-3 d-none d-md-block">
                        <Aside />
                    </div>

                    {/* Main image */}
                    <div className="col-lg-5 col-md-9 col-12">
                        <MainImage />
                    </div>

                    {/* Product info */}
                    <div className="col-lg-5 col-12">
                        <ProductInfo />
                        <Size />
                        <Color />
                        <ProductActions />
                        <ProductMeta />
                    </div>
                </div>

                {/* Tabs and related */}
                <ContentTabs />
                <ProductTabs />
                <RelatedProducts />
            </div>

            <Footer />
        </>
    );
};

export default ProductDetail;
