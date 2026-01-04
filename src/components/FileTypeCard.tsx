import { LucideIcon } from "lucide-react";

interface FileTypeCardProps {
  icon: LucideIcon;
  title: string;
  formats: string[];
  color: string;
  delay?: number;
}

const FileTypeCard = ({ icon: Icon, title, formats, color, delay = 0 }: FileTypeCardProps) => {
  return (
    <div 
      className="glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {formats.map((format) => (
          <span 
            key={format}
            className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground"
          >
            {format}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FileTypeCard;
