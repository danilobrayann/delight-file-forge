import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, Download, Youtube, Video, X } from 'lucide-react';
import { toast } from 'sonner';

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'youtube':
      return <Youtube className="w-5 h-5 text-primary" />;
    case 'tiktok':
      return <Video className="w-5 h-5 text-accent" />;
    default:
      return <Link className="w-5 h-5 text-primary" />;
  }
};

const detectPlatform = (url: string): string => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('facebook.com')) return 'facebook';
  return 'other';
};

const DOWNLOADERS = {
  youtube: {
    name: 'YouTube Downloader',
    url: 'https://y2meta.is/pt75/',
  },
  tiktok: {
    name: 'TikTok Downloader',
    url: 'https://ssstik.io/pt-1',
  },
  default: {
    name: 'Video Downloader',
    url: 'https://y2meta.is/pt75/',
  },
};

export const UrlDownloader = () => {
  const [url, setUrl] = useState('');
  const [showDownloader, setShowDownloader] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentPlatform, setCurrentPlatform] = useState<string>('other');

  const platform = url ? detectPlatform(url) : 'other';

  const handleDownload = () => {
    if (!url.trim()) {
      toast.error('Por favor, insira uma URL válida');
      return;
    }

    const detectedPlatform = detectPlatform(url.trim());
    setCurrentUrl(url.trim());
    setCurrentPlatform(detectedPlatform);
    setShowDownloader(true);
    setUrl('');
    toast.success('Pronto! Use o downloader abaixo para baixar o vídeo.');
  };

  const handleClose = () => {
    setShowDownloader(false);
    setCurrentUrl('');
    setCurrentPlatform('other');
  };

  const getDownloaderConfig = () => {
    if (currentPlatform === 'tiktok') return DOWNLOADERS.tiktok;
    if (currentPlatform === 'youtube') return DOWNLOADERS.youtube;
    return DOWNLOADERS.default;
  };

  const downloaderConfig = getDownloaderConfig();

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Link className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Download de Mídias</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Baixe de{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              YouTube, TikTok
            </span>{' '}
            e mais
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cole a URL do vídeo e baixe diretamente.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 mb-8">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  {getPlatformIcon(platform)}
                </div>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Cole a URL aqui (YouTube, TikTok, Instagram...)"
                  className="pl-12 h-14 bg-background/50 border-border/50 focus:border-primary text-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleDownload();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleDownload}
                variant="gradient"
                size="lg"
                className="h-14 px-8"
                disabled={!url.trim()}
              >
                <Download className="w-5 h-5" />
                Baixar
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <span className="text-sm text-muted-foreground">Plataformas suportadas:</span>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                  <Youtube className="w-4 h-4" />
                  YouTube
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm">
                  <Video className="w-4 h-4" />
                  TikTok
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm">
                  <Video className="w-4 h-4" />
                  Instagram
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
                  <Video className="w-4 h-4" />
                  Twitter
                </div>
              </div>
            </div>
          </div>
        </div>

        {showDownloader && (
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {currentPlatform === 'tiktok' ? (
                  <Video className="w-5 h-5 text-accent" />
                ) : (
                  <Youtube className="w-5 h-5 text-primary" />
                )}
                {downloaderConfig.name}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {currentUrl && (
              <p className="text-sm text-muted-foreground mb-4 truncate">
                URL: {currentUrl}
              </p>
            )}
            <div className="w-full rounded-xl overflow-hidden bg-background/80 border border-border/30">
              <iframe
                src={downloaderConfig.url}
                className="w-full border-0"
                style={{ height: '550px' }}
                title={downloaderConfig.name}
                allow="clipboard-read; clipboard-write"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Cole a URL no campo do downloader e clique para baixar
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
