import { useState, useEffect, useReducer } from "react";
import { useNavigate } from "react-router";
import "../styles/Cart.css";
import { CartItem } from "../models/CartItem";
import { CartReducer, CartActionType } from "../reducers/CartReducer";
import { Product } from "../models/Product";
import Modal from "../Modal";

const Products = () => {
  const [cart, dispatch] = useReducer(CartReducer, [], () => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [emptyCartMessage, setEmptyCartMessage] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Error fetching products: ", error);
      });
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart]);

  const handleAddToCart = (product: Product, quantity: number) => {
    dispatch({
      type: CartActionType.ADD_ITEM,
      payload: new CartItem(product, quantity),
    });

    if (cart.length === 0) {
      setEmptyCartMessage(false);
    }
  };

  const handleChangeQuantity = (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch({
      type: CartActionType.CHANGE_QUANTITY,
      payload: new CartItem(item.product, newQuantity),
    });
  };

  const handleRemoveItem = (item: CartItem) => {
    dispatch({
      type: CartActionType.REMOVE_ITEM,
      payload: item,
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setEmptyCartMessage(true);

      setTimeout(() => {
        const bottomElement = document.getElementById("bottom");
        bottomElement?.scrollIntoView({ behavior: "smooth" });
      }, 50);

      return;
    }

    navigate("/checkout");
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <div className="container">
        <div className="products">
          {products.map((product) => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <img
                src={product.image}
                alt={product.name}
                onClick={() => openModal(product)}
              />
              <p>{product.price} kr</p>
              <button
                onClick={() => handleAddToCart(product, 1)}
                className="add-to-cart-btn"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {selectedProduct && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            product={selectedProduct}
            handleAddToCart={handleAddToCart}
          />
        )}

        <div className="cart-toggle">
          <input type="checkbox" id="cart-toggle" />
          <label htmlFor="cart-toggle">
            Cart
            {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
              <span className="cart-badge">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </label>
          <div className="cart">
            {cart.length === 0 ? (
              <div className="empty-cart-message">
                <h2>Your cart is empty</h2>
                <p>
                  You don't have any items in your cart. Please add items to
                  your cart before proceeding to checkout.
                </p>
              </div>
            ) : (
              <>
                <ul>
                  {cart.map((item) => (
                    <li key={item.product.id}>
                      <span>
                        {item.product.name} ({item.quantity} st)
                        <img src={item.product.image} alt="tårta" />
                      </span>
                      <span>{item.product.price * item.quantity} kr</span>
                      <div className="cartBtns">
                        <button
                          onClick={() =>
                            handleChangeQuantity(item, item.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <button
                          onClick={() =>
                            handleChangeQuantity(item, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                        <button onClick={() => handleRemoveItem(item)}>
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

                <button onClick={handleCheckout}>Proceed to Checkout</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="proceedDiv">
        <button className="proceed" onClick={handleCheckout}>
          Proceed to Checkout
        </button>

        {emptyCartMessage && (
          <div className="empty-cart-message">
            <h2>Your cart is empty</h2>
            <p>
              You don't have any items in your cart. Please add items to your
              cart before proceeding to checkout.
            </p>
          </div>
        )}
      </div>
      <div id="bottom"></div>
    </>
  );
};

export default Products;
