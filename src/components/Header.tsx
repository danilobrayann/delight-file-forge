import { Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full py-6 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">ConvertX</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Recursos
          </a>
          <a href="#formats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Formatos
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Como Funciona
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
