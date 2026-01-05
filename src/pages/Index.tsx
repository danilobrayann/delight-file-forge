import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ConverterSection from "@/components/ConverterSection";
import { UrlDownloader } from "@/components/UrlDownloader";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <ConverterSection />
        <UrlDownloader />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
