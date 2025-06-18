import { useRoutes } from 'react-router-dom';
import './App.css'
import AdminRoute from './routes/AdminRoute';

function App() {
  const routes = useRoutes(AdminRoute);

  return <>{routes}</>;

  return (
    <>
    </>
  )
}

export default App
