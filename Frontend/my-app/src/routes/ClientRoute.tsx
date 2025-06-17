
import { Route, Routes } from "react-router-dom"
import ProductDetail from "../pages/client/Detail/ProductDetail"

const clientRoute = () => {
    return (
        <>
            <Routes>
                <Route path="/detail" element={<ProductDetail />} />
            </Routes>
        </>
    )
}

export default clientRoute
