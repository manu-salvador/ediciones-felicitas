import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { sanitize } from '../utils/sanitize';
import api from '../services/api';

const formatPeso = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

function CartItem({ item, onUpdateQty, onRemove }) {
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start group py-8 border-b border-outline-variant/20 last:border-b-0">
      {/* Cover */}
      <Link to={`/libro/${item.slug || item.bookId}`} className="w-full md:w-36 aspect-[2/3] bg-surface-low overflow-hidden rounded-lg shadow-md transition-transform duration-500 group-hover:scale-[1.02] flex-shrink-0">
        {item.imagen ? (
          <img src={item.imagen} alt={item.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between self-stretch py-1">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/libro/${item.slug || item.bookId}`} className="text-xl font-headline text-on-surface hover:text-primary transition-colors">
              {item.titulo}
            </Link>
            {item.autor && <p className="text-on-surface-variant text-sm mt-0.5">{item.autor}</p>}
          </div>
          <p className="text-lg font-headline text-primary flex-shrink-0 ml-4">{formatPeso(item.precio * item.qty)}</p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {/* Qty */}
          <div className="flex items-center gap-3 bg-surface-low px-4 py-2 rounded-full">
            <button onClick={() => onUpdateQty(item.bookId, item.qty - 1)} className="hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
            <button onClick={() => onUpdateQty(item.bookId, item.qty + 1)} className="hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
          {/* Remove — con confirmación inline */}
          {!confirmDel ? (
            <button
              onClick={() => setConfirmDel(true)}
              className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors text-xs uppercase tracking-widest font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Eliminar
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-on-surface-variant font-medium">¿Eliminar?</span>
              <button onClick={() => onRemove(item.bookId)} className="font-bold text-error hover:underline uppercase tracking-widest">Sí</button>
              <button onClick={() => setConfirmDel(false)} className="font-bold text-on-surface-variant hover:text-on-surface uppercase tracking-widest">No</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onCancel, loading, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl p-8 max-w-sm w-full">
        <h3 className="text-xl font-headline text-on-surface mb-3">{title}</h3>
        <p className="text-on-surface-variant text-sm mb-8">{message}</p>
        {error && <p className="text-error text-sm mb-4">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-widest rounded-full transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 ${confirmClass}`}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddressModal({ user, isAllDigital, onConfirm, onCancel }) {
  const savedAddress = user?.direccion || '';
  const [useNew, setUseNew] = useState(!savedAddress);
  const [nueva, setNueva] = useState({ calle: '', altura: '', detalles: '' });
  const buildNueva = () => {
    const parts = [nueva.calle.trim(), nueva.altura.trim()].filter(Boolean).join(' ');
    return nueva.detalles.trim() ? `${parts}, ${nueva.detalles.trim()}` : parts;
  };
  const [guardar, setGuardar] = useState(true);

  const addressToUse = useNew ? buildNueva() : savedAddress;
  const canContinue = isAllDigital || (useNew ? (nueva.calle.trim() && nueva.altura.trim()) : !!savedAddress);

  const handleConfirm = () => {
    if (!canContinue) return;
    onConfirm(isAllDigital ? null : addressToUse, useNew && guardar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {isAllDigital
              ? <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>
              : <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>}
          </svg>
          <h3 className="text-lg font-headline text-on-surface">
            {isAllDigital ? 'Confirmar compra digital' : 'Dirección de envío'}
          </h3>
        </div>

        {isAllDigital ? (
          <p className="text-sm text-on-surface-variant mb-6">
            Estás comprando una edición digital. El enlace de descarga se enviará a <strong>{user?.email}</strong>.
          </p>
        ) : savedAddress && !useNew ? (
          <div className="mb-4">
            <p className="text-xs text-outline uppercase tracking-widest font-bold mb-2">Enviar a</p>
            <div className="bg-surface-low rounded-lg px-4 py-3 text-sm text-on-surface flex items-start justify-between gap-3">
              <span>{savedAddress}</span>
              <button onClick={() => setUseNew(true)} className="text-primary text-xs font-bold hover:underline flex-shrink-0">Cambiar</button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            {savedAddress && (
              <button onClick={() => setUseNew(false)} className="text-xs text-primary font-bold hover:underline mb-2 block">
                ← Usar dirección guardada
              </button>
            )}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    value={nueva.calle}
                    onChange={(e) => setNueva(n => ({ ...n, calle: sanitize(e.target.value).slice(0, 100) }))}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    placeholder="Calle"
                    maxLength={100}
                    autoFocus
                  />
                </div>
                <input
                  type="number"
                  min="1"
                  value={nueva.altura}
                  onChange={(e) => setNueva(n => ({ ...n, altura: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) }))}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="Altura"
                />
              </div>
              <input
                value={nueva.detalles}
                onChange={(e) => setNueva(n => ({ ...n, detalles: sanitize(e.target.value).slice(0, 100) }))}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="Piso, depto, entre calles..."
                maxLength={100}
              />
            </div>
            {user && (
              <label className="flex items-center gap-2 text-xs text-on-surface-variant mt-2 cursor-pointer">
                <input type="checkbox" checked={guardar} onChange={(e) => setGuardar(e.target.checked)} className="accent-primary" />
                Guardar como dirección predeterminada
              </label>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onCancel} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canContinue}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-primary text-on-primary rounded-full hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-40"
          >
            Continuar al pago
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart, totalPrice } = useCart();
  const { user, isLoggedIn, updateProfile } = useUser();
  const navigate = useNavigate();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [pendingAddress, setPendingAddress] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);

  // Verdadero si TODOS los items del carrito son edición digital
  const isAllDigital = items.length > 0 && items.every((i) => i.edicion === 'digital');

  // Envío gratis para pedidos 100% digitales
  const effectiveShipping = isAllDigital ? 0 : shippingCost;
  const grandTotal = totalPrice + effectiveShipping;

  useEffect(() => {
    api.get('/config/shipping')
      .then((res) => setShippingCost(res.data.shippingCost || 0))
      .catch(() => {});
  }, []);

  const handleCheckoutClick = () => {
    if (!isLoggedIn) { setShowRegisterModal(true); return; }
    // Digital: no hace falta dirección física
    if (isAllDigital) { setShowAddressModal(true); return; }
    // Logueado y con dirección: ir al modal de confirmación directamente
    if (isLoggedIn && user?.direccion) { setShowCheckoutModal(true); return; }
    // Sin dirección guardada: pedirla
    setShowAddressModal(true);
  };

  const handleAddressConfirm = async (direccion, guardar) => {
    if (guardar && updateProfile) {
      try { await updateProfile({ direccion }); } catch (_) { /* no bloqueamos el flujo */ }
    }
    setPendingAddress(direccion);
    setShowAddressModal(false);
    setShowCheckoutModal(true);
  };

  const handleFinalizeCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const payload = {
        items: items.map(i => ({
          bookId: i.bookId,
          titulo: i.titulo,
          autor: i.autor || '',
          precio: Number(i.precio),
          qty: i.qty,
          edicion: i.edicion || 'fisico',
        })),
        direccionEnvio: isAllDigital ? null : (pendingAddress ?? user?.direccion ?? null),
        nombreComprador: user.nombre,
        emailComprador: user.email,
        telefonoComprador: user.telefono || '',
        costoEnvio: effectiveShipping,
      };
      const { data } = await api.post('/orders', payload);
      // Cart is cleared on PaymentSuccessPage after confirmed payment
      // In dev use sandboxInitPoint, in prod use initPoint
      window.location.href = data.initPoint || data.sandboxInitPoint;
    } catch (err) {
      setCheckoutError(err.response?.data?.error || 'Error al procesar el pago. Intentá de nuevo.');
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Necesitás una cuenta</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Para comprar necesitás estar registrado. Así podés ver el estado de tu envío, descargar tus libros digitales y gestionar tus pedidos.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setShowRegisterModal(false); navigate('/login', { state: { tab: 'register' } }); }}
                className="w-full bg-primary text-on-primary py-3 rounded-full font-bold hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                Crear cuenta
              </button>
              <button
                onClick={() => { setShowRegisterModal(false); navigate('/login'); }}
                className="w-full border border-outline-variant text-on-surface py-3 rounded-full font-medium hover:bg-surface-low transition-colors text-sm"
              >
                Ya tengo cuenta — Iniciar sesión
              </button>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-full text-on-surface-variant text-xs hover:text-on-surface transition-colors py-1"
              >
                Volver al carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddressModal && (
        <AddressModal
          user={user}
          isAllDigital={isAllDigital}
          onConfirm={handleAddressConfirm}
          onCancel={() => setShowAddressModal(false)}
        />
      )}

      {showClearModal && (
        <ConfirmModal
          title="¿Vaciar el carrito?"
          message="Se eliminarán todos los libros seleccionados. Esta acción no se puede deshacer."
          confirmLabel="Sí, vaciar"
          confirmClass="bg-primary-container text-primary hover:bg-primary-container/70"
          onConfirm={() => { clearCart(); setShowClearModal(false); }}
          onCancel={() => setShowClearModal(false)}
        />
      )}

      {showCheckoutModal && (
        <ConfirmModal
          title="Confirmar compra"
          message={`Estás a punto de finalizar tu pedido por ${formatPeso(grandTotal)}. ¿Continuás con el pago?`}
          confirmLabel="Continuar al pago"
          confirmClass="bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/20"
          onConfirm={handleFinalizeCheckout}
          onCancel={() => { if (!checkoutLoading) { setShowCheckoutModal(false); setCheckoutError(''); } }}
          loading={checkoutLoading}
          error={checkoutError}
        />
      )}

      <main className="max-w-screen-xl mx-auto px-8 py-16 pt-36">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-headline text-on-surface tracking-tight italic">Tu Carrito de Lectura</h1>
          <p className="text-on-surface-variant mt-2 max-w-lg">
            {items.length > 0
              ? 'Una selección curada de tus futuros descubrimientos literarios.'
              : 'Tu carrito está vacío. Explorá el catálogo para encontrar tu próxima lectura.'
            }
          </p>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-outline-variant mx-auto mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <Link to="/" className="inline-flex items-center gap-3 text-primary font-bold text-lg hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Explorar el Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Items */}
            <div className="lg:col-span-8">
              {items.map((item) => (
                <CartItem key={item.bookId} item={item} onUpdateQty={updateQty} onRemove={removeItem} />
              ))}
              <div className="pt-8 flex items-center justify-between">
                <Link to="/" className="inline-flex items-center gap-3 text-secondary font-medium hover:gap-5 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  Continuar Explorando el Catálogo
                </Link>
                <button
                  onClick={() => setShowClearModal(true)}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  Vaciar carrito
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 p-8 rounded-xl bg-surface-low">
                <h2 className="text-2xl font-headline mb-6 border-b border-outline-variant/20 pb-4">Resumen de Pedido</h2>

                {/* Desglose por ítem */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.bookId} className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface font-medium leading-snug line-clamp-1">{item.titulo}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {item.edicion && (
                            <span className="text-[10px] uppercase tracking-widest text-outline bg-surface-high px-1.5 py-0.5 rounded">
                              {item.edicion === 'digital' ? 'Digital' : 'Físico'}
                            </span>
                          )}
                          <span className="text-xs text-on-surface-variant">
                            {formatPeso(item.precio)} × {item.qty}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-on-surface flex-shrink-0">
                        {formatPeso(item.precio * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-outline-variant/20 mb-6">
                  <div className="flex justify-between text-on-surface-variant text-sm">
                    <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} {items.reduce((s, i) => s + i.qty, 0) === 1 ? 'libro' : 'libros'})</span>
                    <span className="font-medium">{formatPeso(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant text-sm">
                    <span>Envío</span>
                    <span className={effectiveShipping === 0 ? 'text-xs uppercase tracking-tight text-green-600 font-medium' : 'font-medium'}>
                      {effectiveShipping === 0 ? 'Gratis' : formatPeso(effectiveShipping)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-baseline mb-8 pt-4 border-t border-outline-variant/20">
                  <span className="text-lg font-medium">Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-headline text-primary block leading-none">{formatPeso(grandTotal)}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">IVA incluido</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-5 bg-primary text-on-primary rounded-full font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
                >
                  Finalizar Compra
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </button>
                <div className="mt-6 flex justify-center gap-4 text-on-surface-variant/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
                <p className="text-[10px] text-center text-on-surface-variant/50 font-medium mt-3 uppercase tracking-widest leading-relaxed">
                  Envío a todo el país
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
