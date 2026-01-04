import DropZone from "./DropZone";

const ConverterSection = () => {
  return (
    <section id="converter" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comece a <span className="gradient-text">converter</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Arraste seus arquivos ou clique para selecionar. Conversão instantânea e gratuita.
          </p>
        </div>

        <DropZone />
      </div>
    </section>
  );
};

export default ConverterSection;
