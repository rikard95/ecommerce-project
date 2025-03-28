import "./styles/Modal.css";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    image: string;
    description: string;
    price: number;
  };
  handleAddToCart: (product: any, quantity: number) => void;
}

function Modal({ isOpen, onClose, product, handleAddToCart }: IModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{product.name}</h2>
        <img src={product.image} alt={product.name} />
        <p>{product.description}</p>
        <p>{product.price} kr</p>
        <button onClick={() => handleAddToCart(product, 1)}>Add to Cart</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Modal;
