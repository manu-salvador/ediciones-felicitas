import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

// Markdown renderer minimalista — sin dependencias externas
function MarkdownText({ text }) {
  const lines = text.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === '') continue;

    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-outline-variant/30 my-6" />);
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      elements.push(
        <ul key={i} className="list-disc list-inside my-1 text-on-surface">
          <li className="ml-4">{renderInline(line.replace(/^[-*]\s/, ''))}</li>
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      elements.push(
        <ol key={i} className="list-decimal list-inside my-1 text-on-surface">
          <li className="ml-4">{renderInline(line.replace(/^\d+\.\s/, ''))}</li>
        </ol>
      );
      continue;
    }

    // Cualquier otra línea → párrafo
    elements.push(
      <p key={i} className="my-2 leading-relaxed text-on-surface">
        {renderInline(line)}
      </p>
    );
  }

  return <div className="text-base">{elements}</div>;
}

// Renderiza negrita e itálica dentro de una línea
function renderInline(text) {
  if (!text) return text;
  // Solo matchea pares completos con contenido no vacío
  const regex = /\*\*([^*]+)\*\*|_([^_]+)_/g;
  const parts = [];
  let last = 0;
  let match;
  let key = 0;
  let iterations = 0;

  while ((match = regex.exec(text)) !== null) {
    if (++iterations > 1000) break; // safety valve
    if (match.index > last) parts.push(<span key={key++}>{text.slice(last, match.index)}</span>);
    if (match[1]) parts.push(<strong key={key++} className="font-bold">{match[1]}</strong>);
    else if (match[2]) parts.push(<em key={key++} className="italic">{match[2]}</em>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
  return parts.length ? parts : text;
}

export default function PublicacionDetailPage() {
  const { id } = useParams();
  const [pub, setPub]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/publicaciones/${id}`)
      .then(({ data }) => setPub(data))
      .catch((err) => { if (err.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 flex justify-center"><Spinner /></main>
      </div>
    );
  }

  if (notFound || !pub) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20 px-4 max-w-screen-md mx-auto text-center">
          <p className="text-on-surface-variant text-lg">Publicación no encontrada.</p>
          <Link to="/publicaciones" className="mt-4 inline-block text-primary underline text-sm">Ver todas</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24 px-4 sm:px-8 max-w-screen-md mx-auto">

        <Link
          to="/publicaciones"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors mb-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Publicaciones
        </Link>

        <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-4">
          {new Date(pub.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>

        <h1 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-on-surface leading-tight mb-6 break-words">
          {pub.titulo}
        </h1>

        {pub.foto && (
          <div className="rounded-xl overflow-hidden mb-8 shadow-sm">
            <img src={pub.foto} alt={pub.titulo} className="w-full object-cover max-h-[480px]" />
          </div>
        )}

        {/* Contenedor con overflow controlado */}
        <div className="w-full overflow-hidden">
          <MarkdownText text={pub.texto} />
        </div>

      </main>
    </div>
  );
}
