import ClientRoute from "./routes/ClientRoute";
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <ClientRoute />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
