const formatPeso = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

function StockDot({ activo }) {
  if (!activo) return <div className="w-2 h-2 rounded-full bg-outline" />;
  return <div className="w-2 h-2 rounded-full bg-green-500" />;
}

function StockBadge({ stock }) {
  const n = Number(stock ?? 0);
  if (n === 0) return (
    <span className="inline-block bg-error/10 text-error text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Sin stock</span>
  );
  if (n <= 3) return (
    <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{n} uds.</span>
  );
  return (
    <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{n} uds.</span>
  );
}

// Card por libro — visible solo en mobile (< md)
function BookCard({ book, onEdit, onDelete, onToggleActive }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant/20 p-4 flex gap-4 items-start">
      {/* Portada */}
      <div className="w-12 h-16 bg-surface-high rounded-sm shadow-sm overflow-hidden flex-shrink-0">
        {book.imagen ? (
          <img src={book.imagen} alt={book.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-headline text-sm text-on-surface leading-snug line-clamp-2">{book.titulo}</p>
        {book.autor && <p className="text-xs text-on-surface-variant mt-0.5">{book.autor}</p>}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="font-headline text-primary font-bold text-sm">{formatPeso(book.precio)}</span>
          <StockBadge stock={book.stock} />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col gap-2 items-end flex-shrink-0">
        <button
          onClick={() => onToggleActive(book.id, !book.activo)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
            book.activo ? 'bg-green-100 hover:bg-red-100' : 'bg-surface-high hover:bg-green-100'
          }`}
        >
          <StockDot activo={book.activo} />
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            {book.activo ? 'Activo' : 'Inactivo'}
          </span>
        </button>
        <div className="flex gap-2">
          <button onClick={() => onEdit(book)} className="text-on-surface-variant hover:text-primary p-1 transition-colors" title="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onClick={() => onDelete(book)} className="text-on-surface-variant hover:text-error p-1 transition-colors" title="Desactivar">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookTable({ books, onEdit, onDelete, onToggleActive }) {
  if (books.length === 0) {
    return (
      <div className="text-center py-20 text-on-surface-variant">
        No hay libros cargados aún.
      </div>
    );
  }

  return (
    <>
      {/* Mobile: cards (< md) */}
      <div className="flex flex-col gap-3 md:hidden">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>

      {/* Desktop: table (md+) */}
      <div className="hidden md:block bg-white overflow-hidden rounded-xl border border-outline-variant/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-low text-on-surface-variant border-b border-outline-variant/20">
              <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-semibold">Portada</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-semibold">Título & Autor</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-semibold hidden lg:table-cell">Género</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-semibold text-right">Precio</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-semibold text-center hidden lg:table-cell">Stock</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-semibold text-center">Estado</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-surface-low/60 transition-colors group">
                <td className="px-8 py-5">
                  <div className="w-12 h-16 bg-surface-high rounded-sm shadow-sm overflow-hidden transform group-hover:scale-105 transition-transform flex-shrink-0">
                    {book.imagen ? (
                      <img src={book.imagen} alt={book.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-headline text-base text-on-surface leading-snug line-clamp-2">{book.titulo}</span>
                    {book.autor && <span className="text-xs text-on-surface-variant">{book.autor}</span>}
                    {book.isbn && <span className="text-[10px] font-mono text-outline mt-0.5 hidden xl:block">{book.isbn}</span>}
                  </div>
                </td>
                <td className="px-6 py-5 hidden lg:table-cell">
                  {book.categoria ? (
                    <span className="inline-block bg-tertiary-fixed/60 text-on-tertiary-container text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {book.categoria}
                    </span>
                  ) : (
                    <span className="text-outline text-xs">—</span>
                  )}
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="font-headline text-primary font-bold">{formatPeso(book.precio)}</span>
                </td>
                <td className="px-6 py-5 text-center hidden lg:table-cell">
                  <StockBadge stock={book.stock} />
                </td>
                <td className="px-6 py-5 text-center">
                  <button
                    onClick={() => onToggleActive(book.id, !book.activo)}
                    title={book.activo ? 'Desactivar' : 'Activar'}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                      book.activo ? 'bg-green-100 hover:bg-red-100' : 'bg-surface-high hover:bg-green-100'
                    }`}
                  >
                    <StockDot activo={book.activo} />
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      {book.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => onEdit(book)} className="text-on-surface-variant hover:text-primary transition-colors p-1" title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-[1.15rem] h-[1.15rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => onDelete(book)} className="text-on-surface-variant hover:text-error transition-colors p-1" title="Desactivar">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-[1.15rem] h-[1.15rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
