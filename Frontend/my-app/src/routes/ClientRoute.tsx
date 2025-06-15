import type { RouteObject } from "react-router-dom";
import ProductDetail from "../pages/client/Detail/ProductDetail";


const ClientRoute: RouteObject[] = [
    {
        path: "/detail",
        element: <ProductDetail />,
    },
];


export default ClientRoute

