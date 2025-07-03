import { Toaster } from "sonner";
import ClientRoute from "./routes/ClientRoute";
import { WishlistProvider } from "./provider/WishlistContext";

function App() {
  return (
    <WishlistProvider>
      <ClientRoute />
      <Toaster position="top-right" richColors />
    </WishlistProvider>
  );
}

export default App;
