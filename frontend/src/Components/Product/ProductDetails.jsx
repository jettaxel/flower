import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MetaData from "../Layout/MetaData";
import { Carousel } from "react-bootstrap";
import axios from "axios";

const ProductDetails = ({ addItemToCart, cartItems }) => {
  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [btnPulse, setBtnPulse] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { id } = useParams();

  // fetch product
  const productDetails = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:4001/api/v1/product/${id}`);
      setProduct(data.product || {});
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    productDetails(id);
    // small mount animation trigger
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, [id]);

  // Listen for dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    // Check initially
    checkDarkMode();
    
    // Create observer to watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // quantity functions
  const increaseQty = () => {
    if (quantity >= (product.stock ?? 0)) return;
    setQuantity((q) => q + 1);
  };

  const decreaseQty = () => {
    if (quantity <= 1) return;
    setQuantity((q) => q - 1);
  };

  // add to cart with pulse feedback
  const handleAddToCart = async () => {
    await addItemToCart(id, quantity);
    // pulse button briefly
    setBtnPulse(true);
    setTimeout(() => setBtnPulse(false), 600);
  };

  // computed rating width
  const ratingPercent = product.ratings ? (product.ratings / 5) * 100 : 0;

  return (
    <>
      <MetaData title={product.name || "Product"} />

      {/* small inline styles for pulse keyframe */}
      <style>{`
        @keyframes soft-pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,92,246,0.25); }
          70% { transform: scale(1.03); box-shadow: 0 10px 30px -10px rgba(139,92,246,0.18); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
        .soft-pulse { animation: soft-pulse 0.6s ease-in-out; }
      `}</style>

      <div className="min-h-screen flex justify-center items-start py-8 px-4 md:px-6">
        {/* Instagram-style card */}
        <div
          key={isDark ? 'dark' : 'light'}
          className={`${isDark ? 'bg-base-soft border-purple-500/20 shadow-lg' : 'bg-white border-gray-200 shadow-sm'} rounded-xl overflow-hidden flex flex-col w-full max-w-2xl transform transition-all duration-700
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {/* Instagram-style header */}
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-purple-500/20' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold">
                {product.seller ? product.seller.charAt(0).toUpperCase() : 'B'}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-ink text-sm">{product.seller || "Botany & Co"}</p>
                <p className="text-xs text-gray-500 dark:text-ink-muted">Flower Shop</p>
              </div>
            </div>
            <button className="text-gray-600 dark:text-ink-muted">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          {/* Image Carousel - Instagram feed style */}
          <div className="w-full">
            <Carousel pause="hover" className="w-full" indicators={false}>
              {product.images &&
                product.images.map((img) => (
                  <Carousel.Item key={img.public_id}>
                    <div className="w-full aspect-square overflow-hidden bg-gray-100 dark:bg-base-soft">
                      <img
                        src={img.url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Carousel.Item>
                ))}
            </Carousel>
          </div>

          {/* Content section */}
          <div className="p-4">
            {/* Product name */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-ink mb-2">
              {product.name || "Product Name"}
            </h2>

            {/* Seller info */}
            <p className="text-sm text-gray-600 dark:text-ink-muted mb-3">
              Sold by: <span className="font-semibold text-gray-900 dark:text-ink">{product.seller || "Botany & Co"}</span>
            </p>

            {/* Rating stars */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = i < Math.round(product.ratings || 0);
                  return (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${filled ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  );
                })}
              </div>
              <span className="text-sm text-gray-600 dark:text-ink-muted">({product.numOfReviews ?? 0} reviews)</span>
            </div>

            {/* Price */}
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">
              ₱{product.price ? Number(product.price).toFixed(2) : "0.00"}
            </p>

            {/* Stock status */}
            <p className="text-sm mb-4">
              <span className="text-gray-600 dark:text-ink-muted">Status: </span>
              <span className={`font-semibold ${product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </p>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-base-dark rounded-full px-3 py-2">
                <button
                  onClick={decreaseQty}
                  aria-label="Decrease quantity"
                  className="w-8 h-8 rounded-full bg-purple-400 dark:bg-purple-500 text-white text-xl flex items-center justify-center hover:bg-purple-500 dark:hover:bg-purple-600 transition"
                >
                  −
                </button>

                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-12 text-center text-base bg-transparent border-none text-gray-900 dark:text-ink font-semibold"
                />

                <button
                  onClick={increaseQty}
                  aria-label="Increase quantity"
                  className="w-8 h-8 rounded-full bg-purple-400 dark:bg-purple-500 text-white text-xl flex items-center justify-center hover:bg-purple-500 dark:hover:bg-purple-600 transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 rounded-full text-white font-semibold shadow-sm transition-all duration-300 ${
                  product.stock === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                } ${btnPulse ? "soft-pulse" : ""}`}
              >
                Add to Cart
              </button>
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-purple-500/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-ink mb-2">Description</h3>
              <p className="text-gray-700 dark:text-ink-muted leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            {/* Review Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-purple-500/20">
              <button
                className="w-full py-3 px-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition font-semibold flex items-center justify-center gap-2"
                onClick={() => window.alert("Please log in to submit a review (placeholder).")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Submit Your Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
