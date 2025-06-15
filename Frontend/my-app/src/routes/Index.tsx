import { useRoutes } from "react-router-dom";
import ClientRoute from "./ClientRoute";
import AdminRoute from "./AdminRoute";

const Index = () => {
    const routes = useRoutes([
        ...ClientRoute,
        ...AdminRoute,
    ]);
    return routes;
};

export default Index;