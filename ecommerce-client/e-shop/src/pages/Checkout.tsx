import { NavLink } from "react-router";
import { useReducer, useEffect, useState, FormEvent } from "react";
import { CartItem } from "../models/CartItem";
import { CartReducer, CartActionType } from "../reducers/CartReducer";
import "../styles/Checkout.css";

const Checkout = () => {
  const [cart, dispatch] = useReducer(CartReducer, [], () => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [customer, setCustomer] = useState(() => {
    const savedCustomer = localStorage.getItem("customer");
    return savedCustomer
      ? JSON.parse(savedCustomer)
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          street_address: "",
          postalCode: "",
          city: "",
          country: "",
        };
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("customer", JSON.stringify(customer));
  }, [customer]);

  const handleRemoveItem = (item: CartItem) => {
    dispatch({ type: CartActionType.REMOVE_ITEM, payload: item });
  };

  const handleChangeQuantity = (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch({
      type: CartActionType.CHANGE_QUANTITY,
      payload: new CartItem(item.product, newQuantity),
    });
  };

  const isFormValid = () => {
    return Object.values(customer).every((value) => value !== "");
  };

  const handleProceedToPayment = async (orderId: number) => {
    try {
      const response = await fetch(
        "http://localhost:3000/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart: cart,
            orderId: orderId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkout_url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error proceeding to payment:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert("Please fill in all fields in the form.");
      return;
    }

    try {
      let customerData;

      let response = await fetch(
        `http://localhost:3000/customers/email/${customer.email}`
      );
      if (response.ok) {
        customerData = await response.json();
      } else {
        const customerRequestBody = {
          firstname: customer.firstName,
          lastname: customer.lastName,
          email: customer.email,
          password: "somepassword",
          phone: customer.phone,
          street_address: customer.street_address,
          postal_code: customer.postalCode,
          city: customer.city,
          country: customer.country,
        };

        response = await fetch("http://localhost:3000/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerRequestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to create customer");
        }

        customerData = await response.json();
      }

      const customerId = customerData.id;

      const orderResponse = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          order_items: cart.map((item) => ({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price,
          })),
          payment_status: "unpaid",
          payment_id: null,
          order_status: "pending",
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.id;

      await handleProceedToPayment(orderId);
    } catch (error) {
      console.error("Error processing order", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart-message">
        <h2>Your cart is empty</h2>
        <p>You need items in your cart to proceed to checkout.</p>
        <NavLink to="/products">Go to Products</NavLink>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <form className="contactForm" onSubmit={handleSubmitOrder}>
        <input
          type="text"
          placeholder="First Name"
          value={customer.firstName}
          onChange={(e) =>
            setCustomer({ ...customer, firstName: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Last Name"
          value={customer.lastName}
          onChange={(e) =>
            setCustomer({ ...customer, lastName: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          value={customer.email}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="Street Address"
          value={customer.street_address}
          onChange={(e) =>
            setCustomer({ ...customer, street_address: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Postal Code"
          value={customer.postalCode}
          onChange={(e) =>
            setCustomer({ ...customer, postalCode: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="City"
          value={customer.city}
          onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
        />
        <input
          type="text"
          placeholder="Country"
          value={customer.country}
          onChange={(e) =>
            setCustomer({ ...customer, country: e.target.value })
          }
        />
        <button type="submit" disabled={!isFormValid()}>
          Proceed to Payment
        </button>
      </form>

      <ul className="checkout-list">
        {cart.map((item) => (
          <li key={item.product.id}>
            <div className="cart-item-details">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="cart-item-image"
              />
              <span>
                {item.product.name} - {item.quantity} x {item.product.price} kr
              </span>
            </div>
            <div className="cartBtns">
              <button
                onClick={() => handleChangeQuantity(item, item.quantity - 1)}
              >
                -
              </button>
              <button
                onClick={() => handleChangeQuantity(item, item.quantity + 1)}
              >
                +
              </button>
              <button
                className="CheckRemoveBtn"
                onClick={() => handleRemoveItem(item)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h3>
        Total:{" "}
        {cart.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        )}{" "}
        kr
      </h3>
    </div>
  );
};

export default Checkout;
