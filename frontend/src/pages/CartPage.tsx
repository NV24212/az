import { useState } from 'react';
import { useCartStore } from '../lib/cartStore';
import CheckoutModal from '../components/CheckoutModal';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.productId} className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-4">
                <img src={product.imageUrl || 'https://placehold.co/100x100'} alt={product.name} className="w-20 h-20 rounded-md object-cover" />
                <div>
                  <h2 className="font-semibold">{product.name}</h2>
                  <p className="text-sm text-slate-500">${product.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => updateQuantity(product.productId, parseInt(e.target.value))}
                  className="w-16 p-1 border rounded-md text-center"
                />
                <button onClick={() => removeItem(product.productId)} className="text-red-500 hover:text-red-700">
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="text-right text-xl font-bold mt-6">
            Total: ${total.toFixed(2)}
          </div>
          <div className="flex justify-between mt-6">
             <button onClick={clearCart} className="text-sm text-slate-500 hover:underline">
              Clear Cart
            </button>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}
