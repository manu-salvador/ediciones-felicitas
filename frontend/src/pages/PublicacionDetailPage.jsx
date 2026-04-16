import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

// Markdown renderer minimalista — sin dependencias externas
function MarkdownText({ text }) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Línea vacía → separador de párrafo
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Separador ---
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-outline-variant/30 my-6" />);
      i++;
      continue;
    }

    // Lista con viñetas
    if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(<li key={i} className="ml-4">{renderInline(lines[i].replace(/^[-*]\s/, ''))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-3 text-on-surface">{items}</ul>);
      continue;
    }

    // Lista numerada
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={i} className="ml-4">{renderInline(lines[i].replace(/^\d+\.\s/, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-3 text-on-surface">{items}</ol>);
      continue;
    }

    // Párrafo normal — agrupar líneas consecutivas no vacías
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^[-*\d]/.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      elements.push(
        <p key={`p-${i}`} className="my-3 leading-relaxed text-on-surface">
          {renderInline(paraLines.join(' '))}
        </p>
      );
    }
  }

  return <div className="text-base">{elements}</div>;
}

// Renderiza negrita e itálica dentro de una línea
function renderInline(text) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|_(.+?)_|\*(.+?)\*)/g;
  let last = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={key++}>{text.slice(last, match.index)}</span>);
    if (match[2]) parts.push(<strong key={key++} className="font-bold">{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={key++} className="italic">{match[3]}</em>);
    else if (match[4]) parts.push(<em key={key++} className="italic">{match[4]}</em>);
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
