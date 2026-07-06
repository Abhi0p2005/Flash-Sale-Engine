import React, { useState, useEffect } from 'react';
// Corrected to match your exact export names from cromaData.js
import { cromaProducts, cromaCategories, smartphoneBrands, MOCK_USER_PROFILE } from './cromaData.js';

export default function MarketPlace() {
  // Global States
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'profile' | 'history' | 'addresses'
  
  // UI Toggles
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // User Feature States
  const [userProfile, setUserProfile] = useState(MOCK_USER_PROFILE);
  const [newAddressType, setNewAddressType] = useState('Home');
  const [newAddressDetail, setNewAddressDetail] = useState('');
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [paymentData, setPaymentData] = useState({ name: userProfile.name, cardNumber: '' });

  // Load Inventory Data
  useEffect(() => {
    const fetchLiveInventory = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/products/inventory');
        if (response.ok) {
          const liveData = await response.json();
          setProducts(liveData);
        } else {
          // Fallback to cromaProducts when backend is down
          setProducts(cromaProducts);
        }
      } catch (err) {
        setProducts(cromaProducts);
      }
    };
    fetchLiveInventory();
    fetchOrderHistory();
  }, []);

  // Fetch Order History from PostgreSQL Backend
  const fetchOrderHistory = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/checkout/orders/history');
      if (response.ok) {
        const historyData = await response.json();
        setOrderHistory(historyData);
      }
    } catch (err) {
      console.warn("Could not fetch database order history logs.");
    }
  };

  const openCheckoutGateway = () => {
    const randomCard = "4111 " + Array.from({length: 3}, () => Math.floor(1000 + Math.random() * 9000)).join(" ");
    setPaymentData(prev => ({ ...prev, cardNumber: randomCard, name: userProfile.name }));
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const addToCart = (product) => {
    if (product.stockLeft === 0) return;
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddressDetail.trim()) return;
    const freshAddress = {
      id: Date.now(),
      type: newAddressType,
      detail: newAddressDetail
    };
    setUserProfile(prev => ({
      ...prev,
      addresses: [...prev.addresses, freshAddress]
    }));
    setNewAddressDetail('');
    setStatusMessage({ type: 'success', text: '📍 New delivery address saved securely.' });
  };

  // Uses fallback to salePrice if your data objects use that key
  const cartTotal = cart.reduce((sum, item) => sum + ((item.salePrice || item.price || 0) * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const activeAddress = userProfile.addresses.find(a => a.id === selectedAddressId)?.detail || "Default Pickup";

    const transactionPayload = {
      userId: Date.now(),
      customerName: paymentData.name,
      cardNumber: paymentData.cardNumber,
      deliveryAddress: activeAddress,
      itemsBought: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        pricePaid: item.salePrice || item.price
      })),
      totalPrice: cartTotal
    };

    try {
      const response = await fetch('http://localhost:8080/api/v1/checkout/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionPayload)
      });

      if (response.ok) {
        setProducts(prev => prev.map(p => {
          const boughtItem = cart.find(item => item.id === p.id);
          return boughtItem ? { ...p, stockLeft: Math.max(0, (p.stockLeft || 5) - boughtItem.quantity) } : p;
        }));

        const localHistoryMock = {
          id: Date.now(),
          customerName: paymentData.name,
          totalPrice: cartTotal,
          purchaseTime: new Date().toISOString(),
          itemsCount: cartItemCount
        };
        setOrderHistory(prev => [localHistoryMock, ...prev]);
        
        setCart([]);
        setIsCheckoutOpen(false);
        setActiveTab('history');
        setStatusMessage({ 
          type: 'success', 
          text: `🎉 Transaction complete! Packet cataloged under FlashEngine Database Architecture.` 
        });
      } else {
        let errTxt = await response.text();
        setStatusMessage({ type: 'error', text: `❌ Engine Rejection: ${errTxt}` });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: '🔌 Connection error mapping transaction arrays to relational tables.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans antialiased relative">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#1d1d1d] border-b border-gray-800 px-6 py-4 flex items-center justify-between gap-4 shadow-md">
        <div className="flex items-center space-x-8">
          <div className="text-3xl font-extrabold tracking-tight text-white cursor-pointer" onClick={() => { setActiveTab('catalog'); setIsMenuOpen(false); }}>
            flash<span className="text-teal-400">Cart.</span>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 text-sm font-medium hover:text-teal-400 transition focus:outline-none"
          >
            <span className="text-xl">{isMenuOpen ? '✕' : '☰'}</span>
            <span className="text-xs font-bold hidden sm:inline">{isMenuOpen ? 'Close Menu' : 'App Drawer'}</span>
          </button>
        </div>

        <div className="flex-1 max-w-xl mx-4 relative hidden sm:block">
          <input type="text" placeholder="Search catalog inventory arrays..." className="w-full bg-[#2d2d2d] text-sm text-gray-200 placeholder-gray-500 px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400" />
        </div>

        {/* UTILITIES RIGHT */}
        <div className="flex items-center space-x-6 text-sm">
          <button onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }} className={`hover:text-teal-400 transition ${activeTab === 'profile' ? 'text-teal-400 font-bold' : 'text-gray-300'}`}>
            👤 Profile
          </button>
          <button onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }} className={`hover:text-teal-400 transition ${activeTab === 'history' ? 'text-teal-400 font-bold' : 'text-gray-300'}`}>
            📋 History
          </button>
          
          <div className="relative cursor-pointer bg-[#2d2d2d] hover:bg-[#3d3d3d] px-4 py-2 rounded-xl transition flex items-center gap-2 font-bold text-white" onClick={() => setIsCartOpen(true)}>
            🛒 <span>Basket</span>
            <span className="bg-teal-400 text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{cartItemCount}</span>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-[calc(100vh-73px)]">
        
        {/* COMPREHENSIVE SIDEBAR APP MENU */}
        {isMenuOpen && (
          <aside className="absolute left-0 top-0 z-40 w-80 bg-[#191919] border-r border-gray-800 h-full p-4 shadow-2xl transition-all duration-200">
            <div className="space-y-1 mb-6 text-sm text-gray-300 border-b border-gray-800 pb-4">
              <div onClick={() => { setActiveTab('catalog'); setIsMenuOpen(false); }} className="p-2.5 hover:bg-[#2d2d2d] rounded cursor-pointer transition">🛍️ Browse Catalog Grid</div>
              <div onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }} className="p-2.5 hover:bg-[#2d2d2d] rounded cursor-pointer transition">👤 User Profile Settings</div>
              <div onClick={() => { setActiveTab('addresses'); setIsMenuOpen(false); }} className="p-2.5 hover:bg-[#2d2d2d] rounded cursor-pointer transition">📍 Manage Saved Addresses</div>
              <div onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }} className="p-2.5 hover:bg-[#2d2d2d] rounded cursor-pointer transition">📋 Relational Order Receipts</div>
            </div>

            <h3 className="px-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter Catalog</h3>
            <nav className="space-y-0.5 text-sm">
              {cromaCategories.map((cat) => (
                <div key={cat.id} onClick={() => { setActiveTab('catalog'); setIsMenuOpen(false); }} className="flex items-center justify-between p-2.5 rounded hover:bg-[#2d2d2d] cursor-pointer transition text-gray-300">
                  <span className="flex items-center space-x-3"><span>{cat.icon}</span><span>{cat.name}</span></span>
                  <span className="text-gray-600 text-xs">❯</span>
                </div>
              ))}
            </nav>
          </aside>
        )}

        {/* SYSTEM VIEW SWITCHER ROOT */}
        <main className={`flex-1 p-8 transition-all duration-200 ${isMenuOpen ? 'ml-80 opacity-30 pointer-events-none' : ''}`}>
          
          {statusMessage && (
            <div className="mb-6 p-4 rounded-xl text-xs font-bold bg-[#1c241e] text-emerald-400 border border-emerald-900/50">
              {statusMessage.text}
            </div>
          )}

          {/* VIEW 1: CENTRAL STOCK INVENTORY MARKETPLACE */}
          {activeTab === 'catalog' && (
            <section>
              {/* ROUNDED ICON ROW */}
              <div className="flex items-center space-x-6 overflow-x-auto pb-6 mb-8 scrollbar-none">
                {cromaCategories.map((cat) => (
                  <div key={cat.id} className="flex flex-col items-center cursor-pointer group">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#2e1d4d] to-[#1a233a] flex items-center justify-center border border-gray-800 shadow-lg group-hover:border-teal-400 transition-all duration-300">
                      <span className="text-2xl">{cat.icon}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 mt-2 font-medium tracking-wide group-hover:text-teal-400 transition">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-extrabold tracking-wide">Live Electronics Pipeline</h2>
                <p className="text-xs text-gray-400 mt-1">Reactive framework synchronized directly with the multi-item order tracking models.</p>
              </div>

              {/* CARD GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {products.map(product => {
                  const actualPrice = product.salePrice || product.price || 0;
                  return (
                    <div key={product.id} className="bg-gradient-to-b from-[#1c2331] to-[#121620] rounded-2xl p-5 border border-gray-800 flex flex-col justify-between group hover:border-gray-700 transition relative shadow-lg">
                      <div>
                        <div className="relative flex h-40 w-full items-center justify-center bg-[#181d29] rounded-xl border border-gray-800/50 overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-200" />
                          ) : (
                            <div className="text-5xl select-none">{product.icon || '📦'}</div>
                          )}
                        </div>
                        <div className="mt-4">
                          <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">{product.brand || product.category}</p>
                          <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 mt-1 h-10">{product.name}</h3>
                          <div className="flex items-baseline gap-2 mt-2">
                            <div className="text-base font-black text-white">₹{actualPrice.toLocaleString('en-IN')}</div>
                            {product.originalPrice && (
                              <div className="text-xs text-gray-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-2">
                          <span>Stock Allocation:</span>
                          <span className={product.stockLeft === 0 ? 'text-red-500 font-bold' : 'text-emerald-400 font-bold'}>
                            {product.stockLeft === 0 ? 'Sold Out' : `${product.stockLeft !== undefined ? product.stockLeft : 5} Available`}
                          </span>
                        </div>
                        <button 
                          onClick={() => addToCart(product)}
                          disabled={product.stockLeft === 0}
                          className={`w-full font-bold py-2 px-4 rounded-xl transition text-xs tracking-wider uppercase ${product.stockLeft === 0 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 text-black font-extrabold'}`}
                        >
                          {product.stockLeft === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SMARTPHONE BRAND SUBSECTION GRID */}
              <div className="border-t border-gray-800 pt-10">
                <h3 className="text-lg font-bold tracking-wide text-white mb-5">Pick Your Smartphone Brand</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {smartphoneBrands.map((brand) => (
                    <div key={brand.name} className={`h-36 rounded-2xl bg-gradient-to-b ${brand.bgColor} border border-white/5 flex flex-col justify-between p-4 cursor-pointer relative overflow-hidden group shadow-md`}>
                      <div className="text-sm font-bold tracking-wider">{brand.name}</div>
                      <div className="text-4xl self-center transform group-hover:scale-110 transition duration-300 filter drop-shadow-2xl">{brand.logo}</div>
                      <div className="text-[9px] text-white/40 tracking-widest text-right font-bold">EXPLORE ❯</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* VIEW 2: PROFILE CONFIGURATION VIEW */}
          {activeTab === 'profile' && (
            <section className="max-w-2xl bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold border-b border-gray-800 pb-3 mb-4 text-teal-400">Account Profile Context</h2>
              <div className="space-y-4 text-sm">
                <div><label className="text-xs text-gray-500 block uppercase font-bold tracking-wider">Account Identifier Name</label><p className="text-base font-semibold mt-0.5">{userProfile.name}</p></div>
                <div><label className="text-xs text-gray-500 block uppercase font-bold tracking-wider">Communication Channel (Email)</label><p className="text-base font-mono text-gray-300 mt-0.5">{userProfile.email}</p></div>
                <div><label className="text-xs text-gray-500 block uppercase font-bold tracking-wider">Mobile Handset Interface</label><p className="text-base font-mono text-gray-300 mt-0.5">{userProfile.phone}</p></div>
              </div>
            </section>
          )}

          {/* VIEW 3: LIVE TRANSACTION HISTORY PANEL */}
          {activeTab === 'history' && (
            <section className="max-w-4xl">
              <h2 className="text-lg font-bold mb-4 text-teal-400">Persistent Order Receipts Logs</h2>
              {orderHistory.length === 0 ? (
                <div className="p-8 text-center bg-[#1a1a1a] border border-gray-800 rounded-xl text-gray-500 text-sm">No transaction footprints mapped inside the current environment session. Try completing a secure checkout payload loop!</div>
              ) : (
                <div className="space-y-3">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="bg-[#1a1a1a] border border-gray-800 p-4 rounded-xl flex items-center justify-between text-sm">
                      <div className="space-y-1">
                        <div className="font-bold text-gray-200">Receipt Instance #{order.id}</div>
                        <div className="text-xs text-gray-500 font-mono">Timestamp: {new Date(order.purchaseTime).toLocaleString()}</div>
                        <div className="text-xs text-teal-400">Shopper Identity: {order.customerName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-white text-base">₹{order.totalPrice.toLocaleString('en-IN')}</div>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-950/50 border border-emerald-900 text-emerald-400 rounded-full font-bold">Committed DB</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* VIEW 4: ADDRESS ROUTING PANELS */}
          {activeTab === 'addresses' && (
            <section className="max-w-3xl space-y-6">
              <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl">
                <h2 className="text-lg font-bold mb-4 text-teal-400">Saved Shipping Destinations</h2>
                <div className="space-y-3">
                  {userProfile.addresses.map(addr => (
                    <div key={addr.id} className="p-4 bg-[#232323] border border-gray-800 rounded-xl flex items-start gap-4">
                      <span className="bg-teal-950 text-teal-400 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">{addr.type}</span>
                      <p className="text-sm text-gray-300 leading-relaxed">{addr.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddAddress} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Append Core Delivery Coordinates</h3>
                <div className="flex gap-4">
                  {['Home', 'Office', 'Other'].map(t => (
                    <button key={t} type="button" onClick={() => setNewAddressType(t)} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${newAddressType === t ? 'bg-teal-400 text-black border-teal-400' : 'bg-transparent text-gray-400 border-gray-800'}`}>{t}</button>
                  ))}
                </div>
                <input 
                  type="text" 
                  required 
                  placeholder="Type structural street, flat number, city coordinates..." 
                  value={newAddressDetail} 
                  onChange={e => setNewAddressDetail(e.target.value)}
                  className="w-full bg-[#2d2d2d] border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
                <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-black font-bold text-xs uppercase px-5 py-2.5 rounded-xl tracking-wider transition">Save Address Node</button>
              </form>
            </section>
          )}

        </main>
      </div>

      {/* BASKET DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-end backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1a1a1a] border-l border-gray-800 h-full p-6 shadow-2xl flex flex-col justify-between text-white">
            <div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
                <h2 className="text-lg font-black tracking-wide">Secure Buffer Basket</h2>
                <button className="text-gray-400 hover:text-white font-bold text-xl" onClick={() => setIsCartOpen(false)}>✕</button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">Basket arrays are empty.</div>
              ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-none">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3 border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl bg-[#2d2d2d] p-2 rounded-xl border border-gray-700">{item.icon || '📦'}</span>
                        <div>
                          <h4 className="text-sm font-bold text-gray-200 line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">₹{(item.salePrice || item.price).toLocaleString('en-IN')} × {item.quantity}</p>
                        </div>
                      </div>
                      <button className="text-red-400 hover:text-red-500 text-xs font-bold" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-800 pt-4 bg-[#1a1a1a]">
                <div className="flex justify-between font-black text-white text-lg mb-4">
                  <span>Subtotal:</span>
                  <span className="text-teal-400">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <button className="w-full bg-teal-500 hover:bg-teal-600 text-black font-black py-3 px-4 rounded-xl text-center tracking-wider uppercase text-xs" onClick={openCheckoutGateway}>
                  Proceed to Secure Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DYNAMIC SECURE CLEARING GATEWAY MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-gray-800 text-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-white font-bold text-lg" onClick={() => setIsCheckoutOpen(false)}>✕</button>
            
            <div className="text-center mb-6">
              <span className="bg-teal-950 text-teal-400 border border-teal-800/40 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">FlashEngine Secure Network</span>
              <h3 className="text-base font-extrabold text-white mt-3">Active Clearing Node</h3>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Select Delivery Address Allocation</label>
                <select 
                  className="w-full bg-[#2d2d2d] border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                  value={selectedAddressId}
                  onChange={e => setSelectedAddressId(Number(e.target.value))}
                >
                  {userProfile.addresses.map(a => (
                    <option key={a.id} value={a.id}>[{a.type}] {a.detail.substring(0, 40)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Profile Name</label>
                <input type="text" required className="w-full bg-[#2d2d2d] border border-gray-700 rounded-lg p-2.5 text-sm text-white" value={paymentData.name} onChange={e => setPaymentData({...paymentData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dynamic Visa Node Instance</label>
                <input type="text" className="w-full bg-[#222] border border-gray-800 rounded-lg p-2.5 text-sm font-mono text-gray-500 cursor-not-allowed" value={paymentData.cardNumber} readOnly />
              </div>

              <button type="submit" disabled={loading} className={`w-full mt-4 font-black py-3 px-4 rounded-xl text-black uppercase tracking-wider text-xs ${loading ? 'bg-teal-700 animate-pulse' : 'bg-teal-400 hover:bg-teal-500'}`}>
                {loading ? 'Committing Arrays...' : `Authorize Payment • ₹${cartTotal.toLocaleString('en-IN')}`}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}