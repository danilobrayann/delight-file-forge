import { FileText, Image, Video, Music } from "lucide-react";
import FileTypeCard from "./FileTypeCard";

const Features = () => {
  const fileTypes = [
    {
      icon: FileText,
      title: "Documentos",
      formats: ["PDF", "DOCX", "TXT", "RTF", "ODT"],
      color: "#0ea5e9",
    },
    {
      icon: Image,
      title: "Imagens",
      formats: ["PNG", "JPG", "WEBP", "GIF", "SVG"],
      color: "#22c55e",
    },
    {
      icon: Video,
      title: "Vídeos",
      formats: ["MP4", "MOV", "AVI", "WEBM", "MKV"],
      color: "#f97316",
    },
    {
      icon: Music,
      title: "Áudios",
      formats: ["MP3", "WAV", "OGG", "AAC", "FLAC"],
      color: "#a855f7",
    },
  ];

  return (
    <section id="formats" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Suporte a <span className="gradient-text">múltiplos formatos</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Converta entre dezenas de formatos de arquivo com qualidade profissional
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fileTypes.map((type, index) => (
            <FileTypeCard
              key={type.title}
              {...type}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
