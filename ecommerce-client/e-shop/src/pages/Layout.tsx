import { NavLink } from "react-router";
import { Outlet } from "react-router";
import "../styles/Layout.css";
import "../styles/Cart.css";

export const Layout = () => {
  return (
    <div>
      <header>
        <nav className="navBar">
          <ul>
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/products">Products</NavLink>
            </li>
            <li>
              <NavLink to="/checkout">Checkout</NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <Outlet />
        <br />
        <br />
        <br />
        <br />
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};
