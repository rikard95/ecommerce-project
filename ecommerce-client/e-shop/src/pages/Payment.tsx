import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import "../styles/Payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("unpaid");
  const [loading, setLoading] = useState<boolean>(true);
  const [productImages, setProductImages] = useState<{ [key: number]: string }>(
    {}
  );

  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("session_id");

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) {
        console.error("Session ID is missing");
        return;
      }

      try {
        const stripeResponse = await fetch(
          `http://localhost:3000/stripe/session/${sessionId}`
        );

        if (!stripeResponse.ok) {
          throw new Error("Failed to fetch Stripe session");
        }

        const stripeSessionData = await stripeResponse.json();
        const orderId = stripeSessionData.client_reference_id;
        let paymentId = stripeSessionData.id;

        if (!orderId) {
          console.error("Order ID is missing from Stripe session");
          return;
        }

        const orderResponse = await fetch(
          `http://localhost:3000/orders/${orderId}`
        );

        if (!orderResponse.ok) {
          throw new Error("Failed to fetch order details");
        }

        const orderData = await orderResponse.json();
        setOrderDetails(orderData);

        if (stripeSessionData.payment_status === "paid") {
          paymentId = stripeSessionData.payment_intent;
          setPaymentStatus("paid");

          setTimeout(() => {
            updateOrderPaymentStatus(
              orderId,
              "paid",
              paymentId,
              orderData.order_items
            );
          }, 500);
        }

        fetchProductImages(orderData.order_items);
      } catch (error) {
        console.error("Error fetching session details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const fetchProductImages = async (orderItems: any[]) => {
    try {
      const productIds = orderItems.map((item) => item.product_id);
      const response = await fetch(
        `http://localhost:3000/products?ids=${productIds.join(",")}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch product images");
      }

      const products = await response.json();
      const imageMap: { [key: number]: string } = {};
      products.forEach((product: any) => {
        imageMap[product.id] = product.image;
      });

      setProductImages(imageMap);
    } catch (error) {
      console.error("Error fetching product images:", error);
    }
  };

  const updateOrderPaymentStatus = async (
    orderId: number,
    status: string,
    paymentId: string,
    orderItems: any[]
  ) => {
    if (!orderId || !paymentId) {
      console.error(
        "Missing orderId or paymentId, cannot update payment status."
      );
      return;
    }

    const payload = {
      order_status: "received",
      payment_status: status,
      payment_id: paymentId,
      order_items: orderItems,
    };

    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Failed to update payment status:", data);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleGoHomePage = () => {
    localStorage.removeItem("cart");
    localStorage.removeItem("customer");
    navigate("/");
  };

  return (
    <div className="payment-container">
      <h1>Thank you for your order!</h1>

      {loading ? (
        <p>Loading payment details...</p>
      ) : paymentStatus === "paid" ? (
        <h3>Your payment has been successfully completed.</h3>
      ) : (
        <h3>Payment Status: {paymentStatus}</h3>
      )}

      <h3>Your Products:</h3>
      {orderDetails ? (
        <ul>
          {orderDetails.order_items.map((item: any) => (
            <li key={item.product_id}>
              <img
                src={productImages[item.product_id]}
                alt={item.product_name}
              />
              {item.product_name} - {item.quantity} x {item.unit_price} kr
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading order details...</p>
      )}

      <div className="button-container">
        <h3>Total: {orderDetails ? orderDetails.total_price : 0} kr</h3>
        
        <button onClick={handleGoHomePage} className="back">
          Go to Home Page
        </button>
      </div>
    </div>
  );
};

export default Payment;
