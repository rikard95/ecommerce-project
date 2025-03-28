import { RouterProvider, createBrowserRouter } from "react-router";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";

import Products from "./pages/Products";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/products",
        element: <Products />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/payment/:orderId",
        element: <Payment />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
