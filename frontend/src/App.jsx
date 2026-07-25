import React, { useState, useEffect } from 'react';
import MarketPlace from './MarketPlace';
import PulseAIAssistant from './components/PulseAIAssistant';
import { MOCK_USER_PROFILE } from './cromaData.js';
import scrapedProducts from '../scraped_final.json';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState(MOCK_USER_PROFILE);
  const [newAddressType, setNewAddressType] = useState('Home');
  const [newAddressDetail, setNewAddressDetail] = useState('');
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [paymentData, setPaymentData] = useState({ name: userProfile.name, cardNumber: '' });

  useEffect(() => {
    setProducts(scrapedProducts);
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/checkout/orders/history');
      if (response.ok) {
        const historyData = await response.json();
        setOrderHistory(historyData);
      }
    } catch (err) {
      console.warn('Could not fetch database order history logs.');
    }
  };

  const addToCart = (product) => {
    if (product.stockLeft === 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const openCheckoutGateway = () => {
    const randomCard =
      '4111 ' +
      Array.from({ length: 3 }, () => Math.floor(1000 + Math.random() * 9000)).join(' ');
    setPaymentData((prev) => ({ ...prev, cardNumber: randomCard, name: userProfile.name }));
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddressDetail.trim()) return;
    const freshAddress = { id: Date.now(), type: newAddressType, detail: newAddressDetail };
    setUserProfile((prev) => ({ ...prev, addresses: [...prev.addresses, freshAddress] }));
    setNewAddressDetail('');
    setStatusMessage({ type: 'success', text: 'New delivery node saved.' });
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const activeAddress =
      userProfile.addresses.find((a) => a.id === selectedAddressId)?.detail || 'Default Pickup';

    const cartTotal = cart.reduce(
      (sum, item) => sum + (item.salePrice || item.price || 0) * item.quantity, 0
    );

    const transactionPayload = {
      userId: Date.now(),
      customerName: paymentData.name,
      cardNumber: paymentData.cardNumber,
      deliveryAddress: activeAddress,
      itemsBought: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        pricePaid: item.salePrice || item.price,
      })),
      totalPrice: cartTotal,
    };

    try {
      const response = await fetch('http://localhost:8080/api/v1/checkout/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionPayload),
      });

      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) => {
            const boughtItem = cart.find((item) => item.id === p.id);
            return boughtItem
              ? { ...p, stockLeft: Math.max(0, (p.stockLeft || 5) - boughtItem.quantity) }
              : p;
          })
        );

        const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const localHistoryMock = {
          id: Date.now(),
          customerName: paymentData.name,
          totalPrice: cartTotal,
          purchaseTime: new Date().toISOString(),
          itemsCount: cartItemCount,
        };
        setOrderHistory((prev) => [localHistoryMock, ...prev]);
        setCart([]);
        setIsCheckoutOpen(false);
        setActiveTab('history');
        setStatusMessage({ type: 'success', text: 'Transaction complete. Order committed to FlashEngine.' });
      } else {
        let errTxt = await response.text();
        setStatusMessage({ type: 'error', text: `Engine rejection: ${errTxt}` });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Connection error — could not reach FlashEngine.' });
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.salePrice || item.price || 0) * item.quantity, 0
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedBrand && p.brand !== selectedBrand) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const brandList = [
    ...new Set(
      products
        .filter((p) => !selectedCategory || p.category === selectedCategory)
        .map((p) => p.brand)
    ),
  ];

  const marketplaceProps = {
    products, setProducts, cart, setCart, activeTab, setActiveTab,
    selectedCategory, setSelectedCategory, selectedBrand, setSelectedBrand,
    isMenuOpen, setIsMenuOpen, isCartOpen, setIsCartOpen,
    isCheckoutOpen, setIsCheckoutOpen, loading, setLoading,
    statusMessage, setStatusMessage, searchQuery, setSearchQuery,
    userProfile, setUserProfile, newAddressType, setNewAddressType,
    newAddressDetail, setNewAddressDetail, orderHistory, setOrderHistory,
    selectedAddressId, setSelectedAddressId, paymentData, setPaymentData,
    addToCart, removeFromCart, openCheckoutGateway, handleAddAddress,
    handleProcessPayment, cartTotal, cartItemCount, filteredProducts,
    brandList, fetchOrderHistory,
  };

  const aiProps = {
    addToCart, removeFromCart, products, cart, setIsCartOpen,
    setActiveTab, setStatusMessage, openCheckoutGateway,
    handleProcessPayment,
  };

  return (
    <>
      <MarketPlace {...marketplaceProps} />
      <PulseAIAssistant {...aiProps} />
    </>
  );
}
