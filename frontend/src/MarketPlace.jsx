import React, { useState } from 'react';
import { cromaCategories } from './cromaData.js';
import CategoryBar from './CategoryBar';
import SideNav from './SideNav';
import LogoutModal from './LogoutModal';
import {
  ShoppingCart,
  User,
  ClipboardList,
  MapPin,
  Menu,
  X,
  Search,
  ArrowRight,
  Zap,
  Package,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  CircleDot,
  Layers,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Star,
  FileText,
  LogOut,
} from 'lucide-react';

export default function MarketPlace({
  products,
  cart,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  isMenuOpen,
  setIsMenuOpen,
  isCartOpen,
  setIsCartOpen,
  isCheckoutOpen,
  setIsCheckoutOpen,
  loading,
  setLoading,
  statusMessage,
  setStatusMessage,
  searchQuery,
  setSearchQuery,
  userProfile,
  newAddressType,
  setNewAddressType,
  newAddressDetail,
  setNewAddressDetail,
  orderHistory,
  selectedAddressId,
  setSelectedAddressId,
  paymentData,
  setPaymentData,
  addToCart,
  removeFromCart,
  openCheckoutGateway,
  handleAddAddress,
  handleProcessPayment,
  cartTotal,
  cartItemCount,
  filteredProducts,
  brandList,
  user,
  showAuth,
  setShowAuth,
  authMode,
  setAuthMode,
  handleLogin,
  handleRegister,
  handleLogout,
  handleDeleteAddress,
  loadingProducts,
}) {
  const totalStock = products.reduce((s, p) => s + (p.stockLeft || 0), 0);
  const flashCount = products.filter((p) => (p.stockLeft || 0) <= 10).length;
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const onSelectProduct = (product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const onCloseDetail = () => setSelectedProduct(null);

  return (
    <div className="min-h-screen bg-ink-900 text-white antialiased">
      <header className="sticky top-0 z-40 bg-ink-900/85 backdrop-blur-xl border-b border-line-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setActiveTab('catalog');
              setIsMenuOpen(false);
              setSelectedCategory(null);
              setSelectedBrand(null);
              onCloseDetail();
            }}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="w-8 h-8 border border-neon-500 flex items-center justify-center relative">
              <Zap size={15} strokeWidth={2.5} className="text-neon-500" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-neon-500 pulse-neon" />
            </div>
            <span className="font-mono text-[13px] tracking-[0.16em] uppercase text-white">
              flash<span className="text-neon-500">cart</span>
              <span className="text-mute-500">/v1</span>
            </span>
          </button>

          <div className="hidden lg:flex flex-1 max-w-lg mx-auto relative">
            <Search
              size={14}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-mute-500"
            />
            <input
              type="text"
              placeholder="search inventory…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ink-800 border border-line-800 focus:border-neon-500 outline-none pl-9 pr-3 h-9 text-[12px] font-mono text-white placeholder:text-mute-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mute-400">
              <span className="relative w-1.5 h-1.5">
                <span className="absolute inset-0 bg-neon-500 pulse-neon" />
              </span>
              <span>engine · live</span>
            </div>

            {user ? (
              <button
                onClick={() => setIsLogoutOpen(true)}
                className="hidden sm:flex items-center gap-2 border border-line-800 hover:border-neon-500/60 text-mute-300 hover:text-neon-300 h-9 px-3 transition-colors group"
              >
                <User size={12} strokeWidth={2} className="group-hover:text-neon-400" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{user.name || user.email}</span>
                <LogOut size={10} strokeWidth={2} className="text-mute-600 group-hover:text-neon-400/70 transition-colors" />
              </button>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setShowAuth(true); }}
                className="hidden sm:flex items-center gap-2 border border-line-800 hover:border-neon-500 text-mute-300 hover:text-white h-9 px-3 transition-colors"
              >
                <User size={12} strokeWidth={2} />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]">login</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 border border-line-800 hover:border-neon-500 text-white h-9 px-3 transition-colors"
            >
              <ShoppingCart size={14} strokeWidth={2} />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">basket</span>
              <span className="font-mono text-[11px] text-neon-500">[{cartItemCount}]</span>
            </button>

            {isMenuOpen && (
              <button
                onClick={() => setIsMenuOpen(false)}
                className="border border-neon-500/40 bg-neon-500/8 w-9 h-9 flex items-center justify-center text-neon-400 transition-colors"
                aria-label="Close menu"
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}
            {!isMenuOpen && (
              <button
                onClick={() => setIsMenuOpen(true)}
                className="border border-line-800 hover:border-neon-500/50 w-9 h-9 flex items-center justify-center text-white hover:text-neon-400 transition-all duration-200 hover:shadow-[0_0_10px_-2px_rgba(0,255,170,0.15)]"
                aria-label="Open menu"
              >
                <Menu size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </header>

      {statusMessage && (
        <div
          className={`fixed top-20 right-6 z-50 max-w-sm animate-in slide-in-from-top-2 fade-in duration-200 border ${
            statusMessage.type === 'success'
              ? 'border-neon-500/40 bg-ink-900 text-neon-400'
              : 'border-red-500/40 bg-ink-900 text-red-400'
          } shadow-[0_0_25px_-5px_rgba(0,255,170,0.12)]`}
        >
          <div className="flex items-center gap-3 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em]">
            <div className={`w-1.5 h-1.5 rounded-full ${statusMessage.type === 'success' ? 'bg-neon-500' : 'bg-red-500'} animate-pulse`} />
            {statusMessage.text}
            <button
              onClick={() => setStatusMessage(null)}
              className="ml-auto text-mute-500 hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            addToCart={addToCart}
            onClose={onCloseDetail}
          />
        ) : loadingProducts ? (
          <div>
            <section className="border border-line-800 grid grid-cols-1 lg:grid-cols-12 mb-6 animate-pulse">
              <div className="lg:col-span-7 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-line-800">
                <div className="h-3 bg-ink-700 rounded w-1/4 mb-8" />
                <div className="h-10 bg-ink-700 rounded w-3/4 mb-3" />
                <div className="h-10 bg-ink-700 rounded w-1/2 mb-6" />
                <div className="h-4 bg-ink-700 rounded w-2/3 mb-8" />
                <div className="flex gap-3">
                  <div className="h-9 bg-ink-700 rounded w-28" />
                  <div className="h-9 bg-ink-700 rounded w-28" />
                  <div className="h-9 bg-ink-700 rounded w-28" />
                </div>
              </div>
              <div className="lg:col-span-5 p-6 lg:p-8 bg-ink-850">
                <div className="h-32 bg-ink-700 rounded mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-line-800 p-3">
                    <div className="h-3 bg-ink-700 rounded w-2/3 mb-2" />
                    <div className="h-6 bg-ink-700 rounded w-1/2" />
                  </div>
                  <div className="border border-line-800 p-3">
                    <div className="h-3 bg-ink-700 rounded w-2/3 mb-2" />
                    <div className="h-6 bg-ink-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            </section>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-line-800">
              {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)}
            </section>
          </div>
        ) : activeTab === 'catalog' ? (
          <CatalogView
            products={products}
            filteredProducts={filteredProducts}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            brandList={brandList}
            addToCart={addToCart}
            totalStock={totalStock}
            flashCount={flashCount}
            cartItemCount={cartItemCount}
            cartTotal={cartTotal}
            onSelectProduct={onSelectProduct}
          />
        ) : activeTab === 'profile' ? (
          <ProfileView userProfile={userProfile} orderHistory={orderHistory} user={user} setShowAuth={setShowAuth} setAuthMode={setAuthMode} />
        ) : activeTab === 'history' ? (
          <HistoryView orderHistory={orderHistory} setActiveTab={setActiveTab} />
        ) : (
          <AddressesView
            userProfile={userProfile}
            newAddressType={newAddressType}
            setNewAddressType={setNewAddressType}
            newAddressDetail={newAddressDetail}
            setNewAddressDetail={setNewAddressDetail}
            handleAddAddress={handleAddAddress}
            handleDeleteAddress={handleDeleteAddress}
            user={user}
            setShowAuth={setShowAuth}
            setAuthMode={setAuthMode}
          />
        )}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-ink-850 border-l border-line-800 h-full flex flex-col slide-up">
            <div className="flex items-center justify-between px-5 h-14 border-b border-line-800">
              <div className="flex items-center gap-2">
                <ShoppingCart size={14} className="text-neon-500" />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute-400">
                  basket<span className="text-neon-500"> // {cartItemCount} items</span>
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-mute-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-16 h-16 border border-line-800 flex items-center justify-center mb-4">
                  <Package size={22} className="text-mute-500" />
                </div>
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-mute-400">
                  buffer_empty
                </p>
                <p className="text-mute-500 mt-2 text-[13px]">
                  Add items from the catalog to start a transaction.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  {cart.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`px-5 py-4 border-b border-line-900 flex items-center gap-3 ${
                        idx % 2 === 0 ? 'bg-transparent' : 'bg-ink-800/40'
                      }`}
                    >
                      <div className="w-12 h-12 border border-line-800 bg-ink-800 flex items-center justify-center shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Package size={16} className="text-mute-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-mute-500">
                          {item.brand}
                        </div>
                        <div className="text-[13px] text-white truncate">{item.name}</div>
                        <div className="font-mono text-[11px] text-neon-500 mt-0.5">
                          ₹{(item.salePrice || item.price).toLocaleString('en-IN')}{' '}
                          <span className="text-mute-500">× {item.quantity}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-mute-500 hover:text-red-400 transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-line-800 px-5 py-4 bg-ink-900">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute-400">
                      subtotal
                    </span>
                    <span className="font-mono text-[20px] text-white">
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={openCheckoutGateway}
                    className="w-full h-11 bg-neon-500 hover:bg-neon-400 text-ink-950 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors flex items-center justify-center gap-2"
                  >
                    proceed to checkout <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => !loading && setIsCheckoutOpen(false)}
          />
          <div className="relative w-full max-w-md bg-ink-850 border border-line-800 slide-up">
            <div className="flex items-center justify-between px-5 h-12 border-b border-line-800 bg-ink-900">
              <div className="flex items-center gap-2">
                <span className="relative w-1.5 h-1.5">
                  <span className="absolute inset-0 bg-neon-500 pulse-neon" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-500">
                  secure_clearing_node
                </span>
              </div>
              <button
                onClick={() => !loading && setIsCheckoutOpen(false)}
                className="text-mute-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-5 space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500 mb-1.5">
                  delivery_node
                </label>
                <select
                  className="w-full bg-ink-800 border border-line-800 focus:border-neon-500 outline-none px-3 h-10 text-[13px] text-white font-mono transition-colors"
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                >
                  {userProfile.addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.type}] {a.detail.substring(0, 40)}…
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500 mb-1.5">
                  customer_name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-ink-800 border border-line-800 focus:border-neon-500 outline-none px-3 h-10 text-[13px] text-white transition-colors"
                  value={paymentData.name}
                  onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500 mb-1.5">
                  card_instance
                </label>
                <input
                  type="text"
                  className="w-full bg-ink-800 border border-line-800 px-3 h-10 text-[13px] font-mono text-mute-400 cursor-not-allowed"
                  value={paymentData.cardNumber}
                  readOnly
                />
              </div>

              <div className="border-t border-line-800 pt-4 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500">
                  total_due
                </div>
                <div className="font-mono text-[20px] text-white">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full h-11 font-mono text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-2 transition-colors ${
                  loading
                    ? 'bg-neon-600 text-ink-950 opacity-70 cursor-not-allowed'
                    : 'bg-neon-500 hover:bg-neon-400 text-ink-950'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-ink-950 border-t-transparent animate-spin rounded-full" />
                    committing arrays…
                  </>
                ) : (
                  <>
                    authorize payment <ArrowRight size={14} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <SideNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onCartOpen={() => setIsCartOpen(true)}
        cartItemCount={cartItemCount}
        user={user}
        onLogoutClick={() => setIsLogoutOpen(true)}
      />

      {isLogoutOpen && (
        <LogoutModal
          user={user}
          onConfirm={() => { handleLogout(); setIsLogoutOpen(false); }}
          onCancel={() => setIsLogoutOpen(false)}
        />
      )}
    </div>
  );
}

function StatTile({ label, value, sub, accent }) {
  return (
    <div className="border border-line-800 p-5 bg-ink-850 hover:border-line-700 transition-colors relative">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500">
        <span className={`w-1 h-1 ${accent ? 'bg-neon-500' : 'bg-line-700'}`} />
        {label}
      </div>
      <div className="mt-3 font-mono text-[28px] text-white leading-none">{value}</div>
      {sub && <div className="mt-2 text-[11px] text-mute-400">{sub}</div>}
    </div>
  );
}

function CatalogView({
  products, filteredProducts, selectedCategory, setSelectedCategory,
  selectedBrand, setSelectedBrand, brandList, addToCart,
  totalStock, flashCount, cartItemCount, cartTotal,
  onSelectProduct,
}) {
  return (
    <>
      <section className="border border-line-800 grid grid-cols-1 lg:grid-cols-12 mb-6">
        <div className="lg:col-span-7 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-line-800 relative">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-mute-500">
            <CircleDot size={11} className="text-neon-500" strokeWidth={2} />
            <span>flashcart.engine · index/00</span>
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.02] tracking-tight text-white">
            Industrial commerce,
            <br />
            <span className="text-mute-400">rendered at </span>
            <span className="text-neon-500">lightspeed.</span>
          </h1>
          <p className="mt-6 text-mute-400 max-w-lg text-[14px] leading-relaxed">
            A precision inventory grid for makers, tinkerers and impatient shoppers.
            Filter, stack, and clear transactions through the FlashEngine — no fluff, no friction.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mute-400 border border-line-800 px-3 h-9">
              <Wifi size={12} className="text-neon-500" />
              engine · online
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mute-400 border border-line-800 px-3 h-9">
              <span className="text-neon-500">{products.length}</span> skus indexed
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mute-400 border border-line-800 px-3 h-9">
              <span className="text-neon-500">{flashCount}</span> low-stock alerts
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 p-6 lg:p-8 bg-ink-850 relative">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-line-700" />
            <span className="w-2 h-2 bg-line-700" />
            <span className="w-2 h-2 bg-neon-500 pulse-neon" />
            <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500">
              engine.log
            </span>
          </div>
          <pre className="mt-4 font-mono text-[11.5px] leading-6 text-mute-300 whitespace-pre-wrap">
{`> boot sequence OK
> load /catalog.idx ........... `}<span className="text-neon-500">{products.length} skus</span>{`
> compute /stock.tensor ....... `}<span className="text-neon-500">{totalStock} units</span>{`
> connect flashengine://8080 .. `}<span className="text-neon-500">200 OK</span>{`
> awaiting user input _`}<span className="text-neon-500 animate-pulse">▍</span>
          </pre>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="border border-line-800 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute-500">cart / items</div>
              <div className="font-mono text-[22px] text-white mt-1">{cartItemCount}</div>
            </div>
            <div className="border border-line-800 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute-500">cart / total</div>
              <div className="font-mono text-[22px] text-white mt-1">
                ₹{cartTotal.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-line-800 border-b-0 mb-6">
        <StatTile accent label="skus_indexed" value={products.length} sub="live inventory rows" />
        <StatTile label="units_in_stock" value={totalStock.toLocaleString('en-IN')} sub="aggregate quantity" />
        <StatTile label="low_stock" value={flashCount} sub="≤ 10 units remaining" />
        <StatTile label="categories" value={cromaCategories.length} sub="product taxonomies" />
      </section>

      <CategoryBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
      />

      {brandList.length > 0 && (
        <section className="mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-mute-500 mb-3">
            [02] · manufacturers
          </div>
          <div className="flex flex-wrap gap-0 border border-line-800">
            <button
              onClick={() => setSelectedBrand(null)}
              className={`px-3 h-9 border-r border-line-800 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                selectedBrand === null
                  ? 'bg-neon-500 text-ink-950'
                  : 'text-mute-300 hover:text-white'
              }`}
            >
              all_brands
            </button>
            {brandList.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 h-9 border-r border-line-800 last:border-r-0 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  selectedBrand === brand
                    ? 'bg-neon-500 text-ink-950'
                    : 'text-mute-300 hover:text-white'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="flex items-baseline justify-between mb-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-mute-500">
            [03] · inventory_grid
          </div>
          <div className="text-white text-xl mt-1">
            {selectedCategory
              ? cromaCategories.find((c) => c.id === selectedCategory)?.name
              : 'All products'}
            {selectedBrand ? <span className="text-mute-400"> / {selectedBrand}</span> : null}
          </div>
        </div>
        <div className="font-mono text-[11px] text-mute-400">
          <span className="text-neon-500">{filteredProducts.length}</span> result
          {filteredProducts.length !== 1 ? 's' : ''}
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <div className="border border-line-800 p-16 text-center">
          <Package size={22} className="text-mute-500 mx-auto mb-3" />
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-mute-400">
            no_matches
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-line-800">
          {filteredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} index={i} onSelectProduct={onSelectProduct} />
          ))}
        </section>
      )}
    </>
  );
}

function ProductCard({ product, addToCart, index, onSelectProduct }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const price = product.salePrice || product.price || 0;
  const stock = product.stockLeft ?? 0;
  const low = stock > 0 && stock <= 10;
  const out = stock === 0;
  const images = product.images?.length > 0 ? product.images : null;
  const specs = product.specifications && Object.keys(product.specifications).length > 0 ? product.specifications : null;

  const nextImg = (e) => { e.stopPropagation(); setImgIdx((prev) => (prev + 1) % images.length); };
  const prevImg = (e) => { e.stopPropagation(); setImgIdx((prev) => (prev - 1 + images.length) % images.length); };

  return (
    <>
    <div
      className="group relative border-r border-b border-line-800 bg-ink-900 hover:bg-ink-850 transition-colors rise-in cursor-pointer"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      onClick={() => onSelectProduct(product)}
    >
      <div className="relative aspect-square border-b border-line-800 bg-ink-850 overflow-hidden">
        {images ? (
          <div className="relative w-full h-full">
            <img
              src={images[imgIdx]}
              alt={product.name}
              className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-ink-900/70 backdrop-blur border border-line-800 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neon-500 hover:text-ink-950"
                >
                  <ChevronLeft size={14} strokeWidth={2.5} />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-ink-900/70 backdrop-blur border border-line-800 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neon-500 hover:text-ink-950"
                >
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === imgIdx ? 'bg-neon-500' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            {product.rating > 0 && (
              <div className="absolute top-3 left-3 flex items-center gap-1 font-mono text-[10px] text-yellow-400 border border-yellow-600/40 bg-ink-900/80 backdrop-blur px-2 py-1">
                <Star size={10} strokeWidth={2.5} fill="currentColor" />
                {product.rating}
                {product.reviewCount > 0 && (
                  <span className="text-mute-500 ml-1">({product.reviewCount})</span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-mute-500">
            <Package size={32} strokeWidth={1.25} />
          </div>
        )}
        {out ? (
          <div className="absolute top-3 right-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-red-400 border border-red-900/60 bg-red-950/50 px-2 py-1">
            depleted
          </div>
        ) : low ? (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-neon-500 border border-neon-500/40 bg-neon-950/60 px-2 py-1">
            <span className="w-1 h-1 bg-neon-500 pulse-neon" />
            flash · {stock} left
          </div>
        ) : null}
      </div>
      <div className="p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500">{product.brand}</div>
        <h3 className="mt-1.5 text-[14px] leading-snug text-white line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
        <div className="mt-3 flex items-baseline gap-2">
          <div className="font-mono text-[18px] text-white">₹{price.toLocaleString('en-IN')}</div>
          {product.originalPrice && product.originalPrice > price && (
            <>
              <div className="font-mono text-[11px] text-mute-500 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </div>
              <div className="ml-auto font-mono text-[10px] text-neon-500">
                −{Math.round(((product.originalPrice - price) / product.originalPrice) * 100)}%
              </div>
            </>
          )}
        </div>
        {specs && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowSpecs(true); }}
            className="mt-2 flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-mute-400 hover:text-neon-500 transition-colors"
          >
            <FileText size={10} strokeWidth={2} />
            view specs ({Object.keys(specs).length})
          </button>
        )}
        <div className="mt-3 h-[3px] bg-line-900 relative overflow-hidden">
          <div
            className={`h-full ${out ? 'bg-red-500/50' : low ? 'bg-neon-500' : 'bg-white/70'}`}
            style={{ width: `${Math.min(100, Math.max(4, stock))}%` }}
          />
        </div>
        <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute-500 flex justify-between">
          <span>stock</span>
          <span className={out ? 'text-red-400' : low ? 'text-neon-500' : 'text-mute-300'}>{stock} units</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          disabled={out}
          className={`mt-4 w-full h-10 font-mono text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-2 transition-colors ${
            out
              ? 'border border-line-800 text-mute-500 cursor-not-allowed'
              : 'border border-line-700 hover:border-neon-500 hover:bg-neon-500 hover:text-ink-950 text-white'
          }`}
        >
          {out ? 'out_of_stock' : <>add_to_basket <ArrowRight size={12} strokeWidth={2.5} /></>}
        </button>
      </div>
    </div>

    {showSpecs && specs && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={() => setShowSpecs(false)}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <div
          className="relative w-full max-w-lg bg-ink-850 border border-line-800 max-h-[80vh] overflow-y-auto slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 h-12 border-b border-line-800 bg-ink-900 sticky top-0 z-10">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-neon-500">
              <FileText size={12} strokeWidth={2} />
              specifications
            </div>
            <button onClick={() => setShowSpecs(false)} className="text-mute-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="p-5">
            <h3 className="text-white text-[15px] mb-4">{product.name}</h3>
            <table className="w-full">
              <tbody>
                {Object.entries(specs).map(([key, val]) => (
                  <tr key={key} className="border-b border-line-900 last:border-b-0">
                    <td className="py-2.5 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-mute-400 align-top w-2/5">
                      {key}
                    </td>
                    <td className="py-2.5 text-[13px] text-white">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function SkeletonCard() {
  return (
    <div className="relative border-r border-b border-line-800 bg-ink-900 animate-pulse">
      <div className="relative aspect-square border-b border-line-800 bg-ink-850 flex items-center justify-center">
        <div className="w-20 h-20 border border-line-700/50" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-3 bg-ink-700 rounded w-1/3" />
        <div className="h-4 bg-ink-700 rounded w-3/4" />
        <div className="flex items-center justify-between">
          <div className="h-5 bg-ink-700 rounded w-1/4" />
          <div className="h-3 bg-ink-700 rounded w-1/5" />
        </div>
        <div className="h-8 bg-ink-700 rounded w-full" />
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <section className="border border-line-800 animate-pulse">
      <div className="h-12 border-b border-line-800 bg-ink-900" />
      <div className="bg-ink-850 border-b border-line-800 flex items-center justify-center min-h-[320px]">
        <div className="w-48 h-48 border border-line-700/50" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-line-800 space-y-4">
          <div className="h-3 bg-ink-700 rounded w-1/4" />
          <div className="h-6 bg-ink-700 rounded w-3/4" />
          <div className="h-8 bg-ink-700 rounded w-1/3" />
          <div className="h-6 bg-ink-700 rounded w-1/4" />
          <div className="h-11 bg-ink-700 rounded w-full mt-6" />
          <div className="space-y-2 mt-8">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-4 bg-ink-700 rounded w-full" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-7 p-6 lg:p-8 space-y-4">
          <div className="h-3 bg-ink-700 rounded w-1/4" />
          {[1,2,3].map(i => (
            <div key={i} className="border border-line-800 p-4 space-y-2">
              <div className="h-4 bg-ink-700 rounded w-1/2" />
              <div className="h-3 bg-ink-700 rounded w-1/4" />
              <div className="h-4 bg-ink-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductDetail({ product, addToCart, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = product.images?.length > 0 ? product.images : null;
  const specs = product.specifications && Object.keys(product.specifications).length > 0 ? product.specifications : null;
  const reviews = product.reviews?.length > 0 ? product.reviews : null;
  const price = product.salePrice || product.price || 0;

  const nextImg = (e) => { e.stopPropagation(); setImgIdx((prev) => (prev + 1) % images.length); };
  const prevImg = (e) => { e.stopPropagation(); setImgIdx((prev) => (prev - 1 + images.length) % images.length); };

  return (
    <section className="border border-line-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-12 border-b border-line-800 bg-ink-900">
        <button
          onClick={onClose}
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mute-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={14} strokeWidth={2} />
          back to catalog
        </button>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500">
          <span className="text-neon-500">{product.brand}</span>
          <span className="text-mute-600">/</span>
          {product.category}
        </div>
      </div>

      {/* Image carousel */}
      <div className="relative bg-ink-850 border-b border-line-800">
        <div className="max-h-[60vh] min-h-[320px] flex items-center justify-center">
          {images ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={images[imgIdx]}
                alt={product.name}
                className="max-h-[60vh] w-auto max-w-full object-contain p-8"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-ink-900/70 backdrop-blur border border-line-800 text-white hover:bg-neon-500 hover:text-ink-950 transition-colors">
                    <ChevronLeft size={18} strokeWidth={2.5} />
                  </button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-ink-900/70 backdrop-blur border border-line-800 text-white hover:bg-neon-500 hover:text-ink-950 transition-colors">
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {images.map((_, i) => (
                      <span key={i} className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-neon-500' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center text-mute-500 h-80">
              <Package size={48} strokeWidth={1.25} />
            </div>
          )}
        </div>
        {/* Thumbnail strip */}
        {images && images.length > 1 && (
          <div className="flex items-center justify-center gap-2 pb-4 pt-2 overflow-x-auto no-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`w-14 h-14 shrink-0 border transition-all duration-200 ${
                  i === imgIdx
                    ? 'border-neon-500 shadow-[0_0_8px_-2px_rgba(0,255,135,0.3)]'
                    : 'border-line-800 hover:border-line-600 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content grid: details + specs + reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Product info + Ratings + Add to cart */}
        <div className="lg:col-span-5 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-line-800">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute-500">{product.brand}</div>
          <h1 className="mt-2 text-xl lg:text-2xl text-white leading-snug">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <div className="font-mono text-[26px] text-white">₹{price.toLocaleString('en-IN')}</div>
            {product.originalPrice && product.originalPrice > price && (
              <>
                <div className="font-mono text-[14px] text-mute-500 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </div>
                <div className="font-mono text-[12px] text-neon-500">
                  −{Math.round(((product.originalPrice - price) / product.originalPrice) * 100)}%
                </div>
              </>
            )}
          </div>

          {/* Rating badge */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-[14px] text-yellow-400">
              <Star size={16} strokeWidth={2.5} fill="currentColor" />
              {product.rating}
            </div>
            {product.reviewCount > 0 && (
              <div className="font-mono text-[12px] text-mute-400">
                {product.reviewCount.toLocaleString('en-IN')} review{product.reviewCount !== 1 ? 's' : ''}
              </div>
            )}
            <div className="font-mono text-[11px] text-mute-500 border border-line-800 px-2 py-0.5">
              stock · {product.stockLeft ?? 0}
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            disabled={(product.stockLeft ?? 0) === 0}
            className={`mt-6 w-full h-11 font-mono text-[12px] uppercase tracking-[0.22em] flex items-center justify-center gap-2 transition-colors ${
              (product.stockLeft ?? 0) === 0
                ? 'border border-line-800 text-mute-500 cursor-not-allowed'
                : 'border border-line-700 hover:border-neon-500 hover:bg-neon-500 hover:text-ink-950 text-white'
            }`}
          >
            {(product.stockLeft ?? 0) === 0 ? 'out_of_stock' : <>add_to_basket <ArrowRight size={14} strokeWidth={2.5} /></>}
          </button>

          {/* Specifications */}
          {specs && (
            <div className="mt-8">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-neon-500 mb-4">
                <FileText size={12} strokeWidth={2} />
                specifications
              </div>
              <table className="w-full">
                <tbody>
                  {Object.entries(specs).map(([key, val]) => (
                    <tr key={key} className="border-b border-line-900 last:border-b-0">
                      <td className="py-2.5 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-mute-400 align-top w-2/5">{key}</td>
                      <td className="py-2.5 text-[13px] text-white">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Reviews */}
        <div className="lg:col-span-7 p-6 lg:p-8">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-neon-500 mb-6">
            <Star size={12} strokeWidth={2} />
            customer reviews
            {product.reviewCount > 0 && (
              <span className="text-mute-500">({product.reviewCount.toLocaleString('en-IN')})</span>
            )}
          </div>

          {reviews ? (
            <div className="space-y-5">
              {reviews.map((review, i) => (
                <div key={i} className="border border-line-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[12px] text-white">{review.title || 'Review'}</div>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-yellow-400">
                      <Star size={10} strokeWidth={2.5} fill="currentColor" />
                      {review.rating || product.rating}
                    </div>
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-mute-500">
                    {review.author || 'Verified Buyer'}
                  </div>
                  <p className="mt-2 text-[13px] text-mute-300 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-line-800 p-8 text-center">
              <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-mute-400">
                no reviews yet
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProfileView({ userProfile, orderHistory, user, setShowAuth, setAuthMode }) {
  if (!user) {
    return (
      <section className="border border-line-800 p-16 text-center">
        <User size={28} className="text-mute-500 mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-mute-400">unauthenticated</p>
        <p className="text-mute-500 mt-2 text-[13px]">Login or register to view your profile, orders, and delivery nodes.</p>
        <button
          onClick={() => { setAuthMode('login'); setShowAuth(true); }}
          className="mt-6 border border-line-700 hover:border-neon-500 hover:bg-neon-500 hover:text-ink-950 text-white font-mono text-[11px] uppercase tracking-[0.22em] px-4 h-10 inline-flex items-center gap-2 transition-colors"
        >
          authenticate <ArrowRight size={12} strokeWidth={2.5} />
        </button>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-line-800">
      <div className="lg:col-span-4 p-8 border-b lg:border-b-0 lg:border-r border-line-800 bg-ink-850">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-mute-500">user · context</div>
        <div className="mt-6 flex items-center gap-4">
          <div className="w-14 h-14 border border-neon-500 flex items-center justify-center bg-ink-900">
            <User size={22} className="text-neon-500" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-white text-lg">{userProfile.name}</div>
            <div className="font-mono text-[11px] text-mute-400">verified · active</div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-0 border border-line-800">
          <div className="p-4 border-r border-line-800">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute-500">orders</div>
            <div className="font-mono text-[22px] text-white mt-1">{orderHistory.length}</div>
          </div>
          <div className="p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute-500">nodes</div>
            <div className="font-mono text-[22px] text-white mt-1">{userProfile.addresses.length}</div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-8 p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-mute-500 mb-6">
          account · details
        </div>
        {[
          { label: 'identifier', value: userProfile.name },
          { label: 'email_channel', value: userProfile.email, mono: true },
          { label: 'mobile_handset', value: userProfile.phone, mono: true },
        ].map((f) => (
          <div key={f.label} className="grid grid-cols-3 gap-4 border-b border-line-900 py-4 items-baseline">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500">{f.label}</div>
            <div className={`col-span-2 text-[14px] text-white ${f.mono ? 'font-mono text-mute-300' : ''}`}>
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HistoryView({ orderHistory, setActiveTab }) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-mute-500">transactions · ledger</div>
          <div className="text-white text-xl mt-1">Order receipts</div>
        </div>
        <div className="font-mono text-[11px] text-mute-400">
          <span className="text-neon-500">{orderHistory.length}</span> entries
        </div>
      </div>
      {orderHistory.length === 0 ? (
        <div className="border border-line-800 p-16 text-center">
          <ClipboardList size={22} className="text-mute-500 mx-auto mb-3" />
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-mute-400">no_transactions_logged</p>
          <p className="text-mute-500 mt-2 text-[13px]">Complete a checkout to persist an order receipt.</p>
          <button
            onClick={() => setActiveTab('catalog')}
            className="mt-6 border border-line-700 hover:border-neon-500 hover:bg-neon-500 hover:text-ink-950 text-white font-mono text-[11px] uppercase tracking-[0.22em] px-4 h-10 inline-flex items-center gap-2 transition-colors"
          >
            browse catalog <ArrowRight size={12} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div className="border border-line-800">
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 h-10 items-center border-b border-line-800 bg-ink-850 font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500">
            <div className="col-span-2">receipt_id</div>
            <div className="col-span-3">timestamp</div>
            <div className="col-span-4">customer</div>
            <div className="col-span-2 text-right">total</div>
            <div className="col-span-1 text-right">status</div>
          </div>
          {orderHistory.map((order, idx) => (
            <div
              key={order.id}
              className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-4 items-center border-b border-line-900 last:border-b-0 ${
                idx % 2 === 0 ? 'bg-transparent' : 'bg-ink-850/50'
              }`}
            >
              <div className="md:col-span-2 font-mono text-[12px] text-neon-500">#{order.id}</div>
              <div className="md:col-span-3 font-mono text-[11.5px] text-mute-300">
                {new Date(order.purchaseTime).toLocaleString()}
              </div>
              <div className="md:col-span-4 text-[13px] text-white">{order.customerName}</div>
              <div className="md:col-span-2 text-right font-mono text-[14px] text-white">
                ₹{order.totalPrice.toLocaleString('en-IN')}
              </div>
              <div className="md:col-span-1 flex md:justify-end">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-neon-500 border border-neon-500/40 bg-neon-950/50 px-2 py-1">
                  <span className="w-1 h-1 bg-neon-500" />
                  committed
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AddressesView({
  userProfile, newAddressType, setNewAddressType,
  newAddressDetail, setNewAddressDetail, handleAddAddress,
  handleDeleteAddress, user, setShowAuth, setAuthMode,
}) {
  if (!user) {
    return (
      <section className="border border-line-800 p-16 text-center">
        <MapPin size={28} className="text-mute-500 mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-mute-400">unauthenticated</p>
        <p className="text-mute-500 mt-2 text-[13px]">Login to manage delivery nodes.</p>
        <button
          onClick={() => { setAuthMode('login'); setShowAuth(true); }}
          className="mt-6 border border-line-700 hover:border-neon-500 hover:bg-neon-500 hover:text-ink-950 text-white font-mono text-[11px] uppercase tracking-[0.22em] px-4 h-10 inline-flex items-center gap-2 transition-colors"
        >
          authenticate <ArrowRight size={12} strokeWidth={2.5} />
        </button>
      </section>
    );
  }
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 border border-line-800">
        <div className="px-5 h-11 flex items-center border-b border-line-800 bg-ink-850">
          <MapPin size={13} className="text-neon-500 mr-2" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute-400">saved · delivery_nodes</span>
        </div>
        {userProfile.addresses.length === 0 ? (
          <div className="p-8 text-center text-mute-500 text-[13px]">No delivery nodes configured.</div>
        ) : (
          userProfile.addresses.map((addr) => (
            <div key={addr.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-line-900 last:border-b-0 items-start">
              <div className="col-span-3 sm:col-span-2">
                <span className="inline-flex font-mono text-[10px] uppercase tracking-[0.22em] text-neon-500 border border-neon-500/40 bg-neon-950/50 px-2 py-1">
                  {addr.type}
                </span>
              </div>
              <div className="col-span-7 sm:col-span-8 text-[13px] text-mute-300 leading-relaxed">{addr.detail}</div>
              <div className="col-span-2 sm:col-span-2 flex justify-end">
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-mute-500 hover:text-red-400 transition-colors"
                  aria-label="Delete address"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleAddAddress} className="lg:col-span-5 border border-line-800 flex flex-col">
        <div className="px-5 h-11 flex items-center border-b border-line-800 bg-ink-850">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute-400">append · new_node</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500 mb-2">node_type</label>
            <div className="flex border border-line-800">
              {['Home', 'Office', 'Other'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewAddressType(t)}
                  className={`flex-1 h-9 font-mono text-[10.5px] uppercase tracking-[0.22em] border-r border-line-800 last:border-r-0 transition-colors ${
                    newAddressType === t ? 'bg-neon-500 text-ink-950' : 'text-mute-300 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500 mb-2">coordinates</label>
            <textarea
              required
              rows={4}
              placeholder="street / flat / city / pin ..."
              value={newAddressDetail}
              onChange={(e) => setNewAddressDetail(e.target.value)}
              className="w-full bg-ink-800 border border-line-800 focus:border-neon-500 outline-none px-3 py-2.5 text-[13px] text-white transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full h-10 bg-neon-500 hover:bg-neon-400 text-ink-950 font-mono text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-2 transition-colors"
          >
            save_node <ArrowRight size={12} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </section>
  );
}
