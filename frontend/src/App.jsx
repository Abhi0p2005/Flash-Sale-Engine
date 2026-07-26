import React, { useState, useEffect, useCallback, useRef } from 'react';
import MarketPlace from './MarketPlace';
import PulseAIAssistant from './components/PulseAIAssistant';
import AuthModal from './AuthModal';
import * as api from './api';
import scrapedProducts from '../scraped_final.json';

function enrichCart(cartItems, products) {
  return cartItems.map((item) => {
    const product = products.find((p) => String(p.id) === String(item.productId));
    return {
      id: item.id,
      productId: item.productId,
      name: item.productName || product?.name || 'Unknown',
      brand: product?.brand || '',
      image: item.productImage || product?.images?.[0] || '',
      quantity: item.quantity,
      salePrice: item.price || product?.salePrice || product?.price || 0,
      price: item.price || product?.salePrice || product?.price || 0,
      stockLeft: product?.stockLeft ?? 0,
    };
  });
}

function enrichOrders(orders) {
  return orders.map((o) => ({
    id: o.id,
    customerName: o.customerName || '',
    totalPrice: o.totalAmount || o.totalPrice || 0,
    purchaseTime: o.createdAt || o.purchaseTime || new Date().toISOString(),
    itemsCount: o.items?.length || 0,
    status: o.status || 'COMMITTED',
  }));
}

export default function App() {
  const [user, setUser] = useState(api.getStoredUser());
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [newAddressType, setNewAddressType] = useState('Home');
  const [newAddressDetail, setNewAddressDetail] = useState('');
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentData, setPaymentData] = useState({ name: '', cardNumber: '' });

  const loadUserData = useCallback(async () => {
    try {
      const [profile, cartData, ordersData, addrData] = await Promise.all([
        api.fetchProfile(),
        api.fetchCart(),
        api.fetchOrders(),
        api.fetchAddresses(),
      ]);
      setUserProfile({ ...profile, addresses: addrData || [] });
      setCart(enrichCart(cartData?.items || [], products));
      setOrderHistory(enrichOrders(ordersData || []));
    } catch (err) {
      console.warn('Failed to load user data', err);
      api.logout();
      setUser(null);
    }
  }, [products]);

  useEffect(() => {
    setLoadingProducts(true);
    api.fetchProducts().then((data) => {
      if (data && data.length > 0) {
        return data;
      }
      throw new Error('API returned empty');
    }).catch(() => {
      return scrapedProducts;
    }).then((products) => {
      setProducts(products);
      api.fetchStockBatch(products.map(p => p.id)).then((stockMap) => {
        if (stockMap) {
          setProducts(prev => prev.map(p => ({
            ...p,
            stockLeft: stockMap[String(p.id)] ?? stockMap[p.id] ?? p.stockLeft ?? 0,
          })));
        }
      }).catch(() => {});
    }).finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  useEffect(() => {
    if (user && products.length > 0) {
      loadUserData();
    } else if (!user) {
      setUserProfile(null);
      setCart([]);
      setOrderHistory([]);
    }
  }, [user, products.length]);

  const handleLogin = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    setShowAuth(false);
    setStatusMessage({ type: 'success', text: 'Authenticated. Session key valid.' });
  };

  const handleRegister = async (name, email, password, phone) => {
    const data = await api.register(name, email, password, phone);
    setUser(data.user);
    setShowAuth(false);
    setStatusMessage({ type: 'success', text: 'Identity created. Welcome to FlashEngine.' });
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setStatusMessage({ type: 'success', text: 'Session terminated.' });
  };

  const addToCart = async (product) => {
    if (!user) { setShowAuth(true); return; }
    const liveStock = await api.fetchProductStock(product.id).then(r => r?.stockLeft).catch(() => null);
    const currentStock = liveStock ?? product.stockLeft ?? 0;
    if (currentStock <= 0) {
      setStatusMessage({ type: 'error', text: `"${product.name}" is out of stock` });
      setTimeout(() => setStatusMessage(null), 2500);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockLeft: 0 } : p));
      return;
    }
    try {
      await api.addToCartAPI(product.id, product.name, product.images?.[0] || '', 1, product.salePrice || product.price);
      const cartData = await api.fetchCart();
      setCart(enrichCart(cartData?.items || [], products));
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockLeft: currentStock - 1 } : p));
      setStatusMessage({ type: 'success', text: `"${product.name}" added to basket` });
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err) {
      console.warn('addToCart failed', err);
      setStatusMessage({ type: 'error', text: `Failed to add "${product.name}" to basket` });
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.removeCartItem(cartItemId);
      const cartData = await api.fetchCart();
      setCart(enrichCart(cartData?.items || [], products));
    } catch (err) {
      console.warn('removeFromCart failed', err);
    }
  };

  const openCheckoutGateway = () => {
    const randomCard = '4111 ' + Array.from({ length: 3 }, () => Math.floor(1000 + Math.random() * 9000)).join(' ');
    setPaymentData({ name: userProfile?.name || '', cardNumber: randomCard });
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddressDetail.trim()) return;
    try {
      const lines = newAddressDetail.split('\n').filter(Boolean);
      const addr = await api.addAddress({
        type: newAddressType,
        detail: newAddressDetail,
        line1: lines[0] || newAddressDetail,
        city: '—',
        state: '—',
        pincode: '—',
      });
      setUserProfile((prev) => ({ ...prev, addresses: [...(prev?.addresses || []), addr] }));
      setNewAddressDetail('');
      setStatusMessage({ type: 'success', text: 'New delivery node saved.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to save address.' });
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.deleteAddress(id);
      setUserProfile((prev) => ({ ...prev, addresses: (prev?.addresses || []).filter((a) => a.id !== id) }));
      setStatusMessage({ type: 'success', text: 'Delivery node removed.' });
    } catch (err) {
      console.warn('deleteAddress failed', err);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    try {
      const result = await api.checkoutAPI(selectedAddressId, 'CARD');
      setCart([]);
      setIsCheckoutOpen(false);
      setActiveTab('history');
      setStatusMessage({ type: 'success', text: 'Transaction complete. Order committed to FlashEngine.' });
      const ordersData = await api.fetchOrders();
      setOrderHistory(enrichOrders(ordersData || []));
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Engine rejection: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.salePrice || item.price || 0) * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedBrand && p.brand !== selectedBrand) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.brand?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const brandList = [...new Set(products.filter((p) => !selectedCategory || p.category === selectedCategory).map((p) => p.brand).filter(Boolean))];

  const profileWithDefaults = userProfile || { name: user?.name || 'Guest', email: user?.email || '', phone: '', addresses: [] };

  const marketplaceProps = {
    products, setProducts, cart, setCart, activeTab, setActiveTab,
    selectedCategory, setSelectedCategory, selectedBrand, setSelectedBrand,
    isMenuOpen, setIsMenuOpen, isCartOpen, setIsCartOpen,
    isCheckoutOpen, setIsCheckoutOpen, loading, setLoading,
    loadingProducts,
    statusMessage, setStatusMessage, searchQuery, setSearchQuery,
    userProfile: profileWithDefaults, setUserProfile,
    newAddressType, setNewAddressType, newAddressDetail, setNewAddressDetail,
    orderHistory, setOrderHistory,
    selectedAddressId, setSelectedAddressId, paymentData, setPaymentData,
    addToCart, removeFromCart, openCheckoutGateway, handleAddAddress,
    handleProcessPayment, cartTotal, cartItemCount, filteredProducts,
    brandList,
    user, showAuth, setShowAuth, authMode, setAuthMode,
    handleLogin, handleRegister, handleLogout, handleDeleteAddress,
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
      {showAuth && (
        <AuthModal
          mode={authMode}
          onSwitchMode={() => setAuthMode((m) => (m === 'login' ? 'register' : 'login'))}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
