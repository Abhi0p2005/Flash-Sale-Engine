import { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal, X, ArrowUp, Sparkles, Package } from 'lucide-react';

const SUGGESTIONS = [
  'filter mobiles under ₹40,000',
  'organize my cart by category',
  'checkout with my Home address',
  'Is shipping free?',
  'What\'s the return policy?',
  'show my cart',
  'show my orders',
  'show laptops under ₹1,00,000',
];

export default function PulseAIAssistant({
  addToCart,
  products,
  cart,
  removeFromCart,
  setIsCartOpen,
  setActiveTab,
  setStatusMessage,
  openCheckoutGateway,
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'booting flashcart.ai.core' },
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const scrollToBottom = useCallback(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const findProduct = (query) => {
    const lower = query.toLowerCase();
    return products.find(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower)
    );
  };

  const parseIntent = (text) => {
    const lower = text.toLowerCase().trim();

    const addMatch = lower.match(/(?:add|put)\s+(.+?)\s+(?:to\s+)?(?:cart|basket|bag)/);
    if (addMatch) {
      const product = findProduct(addMatch[1]);
      if (product) {
        addToCart(product);
        setStatusMessage({ type: 'success', text: `Added ${product.name} to basket.` });
        return `Added **${product.name}** to basket.`;
      }
      return `Could not find "${addMatch[1]}" in inventory.`;
    }

    const removeMatch = lower.match(/(?:remove|delete|take)\s+(.+?)\s+(?:from\s+)?(?:cart|basket|bag)/);
    if (removeMatch) {
      const cartItem = cart.find(
        (c) =>
          c.name.toLowerCase().includes(removeMatch[1].toLowerCase()) ||
          c.brand.toLowerCase().includes(removeMatch[1].toLowerCase())
      );
      if (cartItem) {
        removeFromCart(cartItem.id);
        setStatusMessage({ type: 'success', text: `Removed ${cartItem.name} from basket.` });
        return `Removed **${cartItem.name}** from basket.`;
      }
      return `"${removeMatch[1]}" not found in your basket.`;
    }

    if (/(?:show|open|view)\s+(?:my\s+)?(?:cart|basket|bag)/.test(lower)) {
      setIsCartOpen(true);
      return 'Opening your basket.';
    }

    if (/(?:checkout|pay|buy|purchase)/.test(lower) && !lower.includes('shipping') && !lower.includes('return')) {
      openCheckoutGateway();
      return 'Opening the secure checkout gateway.';
    }

    if (/(?:show|view)\s+(?:my\s+)?(?:orders|history|receipts)/.test(lower)) {
      setActiveTab('history');
      return 'Navigating to order history.';
    }

    if (/(?:filter|show)\s+(.+?)\s+(?:under|below|less than|≤)\s*₹?([\d,]+)/.test(lower)) {
      const m = lower.match(/(?:filter|show)\s+(.+?)\s+(?:under|below|less than|≤)\s*₹?([\d,]+)/);
      const category = m[1].trim();
      const price = parseInt(m[2].replace(/,/g, ''));
      setActiveTab('catalog');
      setStatusMessage({ type: 'success', text: `Filtering ${category} under ₹${price.toLocaleString('en-IN')}.` });
      return `Filtering **${category}** under ₹${price.toLocaleString('en-IN')}.`;
    }

    return null;
  };

  const handleSubmit = async (text) => {
    const userText = (text || prompt).trim();
    if (!userText || loading) return;
    setPrompt('');
    setMessages((prev) => [...prev, { role: 'user', content: `$ ${userText}` }]);
    setLoading(true);

    const intentResult = parseIntent(userText);
    if (intentResult) {
      setMessages((prev) => [...prev, { role: 'bot', content: `→ ${intentResult}` }]);
      setLoading(false);
      return;
    }

    const botId = Date.now();
    setMessages((prev) => [...prev, { role: 'bot', content: '→ thinking...', id: botId }]);

    try {
      const history = messages
        .filter((m) => m.content && !m.content.startsWith('→'))
        .map((m) => ({
          role: m.role === 'bot' ? 'assistant' : 'user',
          content: m.content.replace(/^\$ /, ''),
        }));
      history.push({ role: 'user', content: userText });

      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, product_context: '' }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data.startsWith('[ERROR]')) break;
            accumulated += data;
            setMessages((prev) =>
              prev.map((m) => (m.id === botId ? { ...m, content: `→ ${accumulated}` } : m))
            );
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, content: '→ [error] network unreachable' } : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open flashCart AI Assistant"
        className={`fixed bottom-6 right-6 z-[60] group flex items-center gap-2 border transition-all duration-200
          ${open
            ? 'bg-neon-500 border-neon-500 text-ink-950'
            : 'bg-ink-800 border-line-800 hover:border-neon-500 text-white'}
          px-4 h-12 font-mono text-[11px] uppercase tracking-[0.18em]`}
      >
        <span className="relative flex items-center justify-center w-2.5 h-2.5">
          <span className={`absolute inline-flex h-full w-full ${open ? 'bg-ink-950' : 'bg-neon-500 pulse-neon'}`} />
        </span>
        <Terminal size={14} strokeWidth={2} />
        <span>{open ? 'close' : 'ask flashcart ai'}</span>
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-[59] w-[calc(100vw-3rem)] sm:w-[420px] max-h-[70vh] slide-up
                     bg-ink-850 border border-line-800 shadow-[0_20px_80px_-20px_rgba(0,255,135,0.15)]
                     flex flex-col"
        >
          <div className="flex items-center justify-between px-4 h-11 border-b border-line-800 bg-ink-900">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-line-700" />
                <span className="w-2 h-2 bg-line-700" />
                <span className="relative w-2 h-2">
                  <span className="absolute inset-0 bg-neon-500 pulse-neon" />
                </span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute-400">
                flashcart<span className="text-neon-500"> // ai</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-neon-500 uppercase tracking-widest hidden sm:inline">
                idle · listening
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-mute-400 hover:text-white transition"
                aria-label="Close assistant"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto p-5 font-mono text-[12.5px] leading-relaxed no-scrollbar space-y-2">
            <div className="flex items-start gap-2 text-neon-500">
              <span className="text-mute-500">$</span>
              <span>booting flashcart.ai.core</span>
            </div>
            <div className="text-mute-400 pl-4">→ status: <span className="text-neon-500">online</span></div>

            <div className="mt-6 border border-line-800 p-4 bg-ink-900/60">
              <div className="flex items-center gap-2 text-white text-[13px] font-sans">
                <Sparkles size={14} className="text-neon-500" strokeWidth={2} />
                <span className="font-semibold">flashCart AI Assistant</span>
              </div>
              <p className="mt-2 text-mute-400 font-sans text-[12.5px] leading-relaxed">
                Ask me to filter, checkout, or organize your cart — powered by PulseAI.
              </p>
            </div>

            {messages.slice(1).map((msg, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`${msg.role === 'user' ? 'text-neon-500' : 'text-mute-500'} shrink-0`}>
                  {msg.role === 'user' ? '$' : '→'}
                </span>
                <span className={`${msg.role === 'user' ? 'text-white' : 'text-mute-300'}`}>
                  {msg.content.replace(/^\$ /, '')}
                </span>
              </div>
            ))}

            <div className="mt-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-mute-500 mb-2">
                &gt; try_prompts
              </div>
              <div className="flex flex-col gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSubmit(s)}
                    className="text-left border border-line-900 hover:border-neon-500 hover:text-neon-500 text-mute-300 px-3 py-2 text-[12px] transition-colors"
                  >
                    <span className="text-mute-500 mr-2">→</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="mt-4 border border-line-800 p-3 bg-ink-900/40">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-neon-500 mb-2">
                  <Package size={12} />
                  basket · {cart.length} items
                </div>
                {cart.slice(0, 3).map((item) => (
                  <div key={item.id} className="text-[11px] text-mute-300 flex justify-between py-0.5">
                    <span className="truncate mr-2">{item.name}</span>
                    <span className="text-mute-500 shrink-0">×{item.quantity}</span>
                  </div>
                ))}
                {cart.length > 3 && (
                  <div className="text-[10px] text-mute-500 mt-1">
                    +{cart.length - 3} more items
                  </div>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            className="border-t border-line-800 bg-ink-900 px-3 py-2.5 flex items-center gap-2"
          >
            <span className="font-mono text-[13px] text-neon-500 select-none">$</span>
            <input
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="type a command…"
              disabled={loading}
              className="flex-1 bg-transparent outline-none font-mono text-[12.5px] text-white placeholder:text-mute-500"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="border border-line-800 hover:border-neon-500 hover:text-neon-500 text-mute-300 w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-40"
              aria-label="Send"
            >
              <ArrowUp size={14} strokeWidth={2} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
