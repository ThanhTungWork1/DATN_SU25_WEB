import { Toaster } from "sonner";
import ClientRoute from "./routes/ClientRoute";

function App() {
  return (
    <>
      <ClientRoute />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
