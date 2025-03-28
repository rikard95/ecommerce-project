import { NavLink } from "react-router";
import "../styles/Home.css";

export const Home = () => {
  return (
    <div className="home-container">
      <section className="hero">
        <h1>Hi and welcome! </h1>
        <p>
          We've gathered our favorite products, take a look and find something
          you like!
        </p>
        <button className="btn">
          <NavLink to="/products" className="link">
            Products
          </NavLink>
        </button>
      </section>

      <section className="features">
        <div className="feature">
          <img
            src="https://viking-cult.com/cdn/shop/files/t-shirt-drake-varg.jpg?v=1689634788&width=1024"
            alt="Snabb Leverans"
          />
          <h3>Super fast delivery </h3>
          <p>Get your products faster than you can say 'shopping'! </p>
        </div>
        <div className="feature">
          <img
            src="https://us.evisu.com/cdn/shop/files/2eajxm2je112xxct-indw_2_qg336cbrjwbv5wx6_f273c87b-0448-4a25-9d77-4f698b3fed3d.jpg?v=1723487932&width=1000"
            alt="Säker Betalning"
          />
          <h3>Secure and easy payment </h3>
          <p>We ensure that your payment is safe and smooth.</p>
        </div>
        <div className="feature">
          <img
            src="https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSCy8yeCYWiLr30R21riDkRac51TGBiXg5rfz36xXSh5czOf1BlAHCtcCyeyGS7Tcqb7tlxCFXJNsj3JKptLPvpyzFJPB7_RxHvv8nZjAoRHHoMIEbj0aYlT5GK6zH1TXks&usqp=CAc"
            alt="Bäst Kvalitet"
          />
          <h3>Reviewed Products </h3>
          <p>Only products we truly love make it here!</p>
        </div>
      </section>
    </div>
  );
};
