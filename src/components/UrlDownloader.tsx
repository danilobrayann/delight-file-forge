import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, Download, Loader2, Youtube, Music, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DownloadResult {
  id: string;
  url: string;
  title: string;
  platform: string;
  format: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  downloadUrl?: string;
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'youtube':
      return <Youtube className="w-5 h-5 text-red-500" />;
    case 'tiktok':
      return <Video className="w-5 h-5 text-pink-500" />;
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

const getFormatOptions = (platform: string) => {
  const commonFormats = [
    { value: 'mp4-720', label: 'Vídeo MP4 (720p)' },
    { value: 'mp4-1080', label: 'Vídeo MP4 (1080p)' },
    { value: 'mp3', label: 'Áudio MP3' },
    { value: 'wav', label: 'Áudio WAV' },
  ];

  if (platform === 'youtube') {
    return [
      ...commonFormats,
      { value: 'mp4-4k', label: 'Vídeo MP4 (4K)' },
      { value: 'webm', label: 'Vídeo WebM' },
    ];
  }

  return commonFormats;
};

export const UrlDownloader = () => {
  const [url, setUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('mp4-720');
  const [downloads, setDownloads] = useState<DownloadResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const platform = url ? detectPlatform(url) : 'other';
  const formatOptions = getFormatOptions(platform);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Por favor, insira uma URL válida');
      return;
    }

    const detectedPlatform = detectPlatform(url);
    const newDownload: DownloadResult = {
      id: Date.now().toString(),
      url: url.trim(),
      title: `Vídeo de ${detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)}`,
      platform: detectedPlatform,
      format: selectedFormat,
      status: 'processing',
    };

    setDownloads(prev => [newDownload, ...prev]);
    setIsProcessing(true);
    setUrl('');

    // Simulate processing (in production, this would call an edge function)
    setTimeout(() => {
      setDownloads(prev =>
        prev.map(d =>
          d.id === newDownload.id
            ? { ...d, status: 'ready', downloadUrl: '#', title: `${detectedPlatform}_video_${Date.now()}` }
            : d
        )
      );
      setIsProcessing(false);
      toast.success('Mídia processada! Clique em "Baixar" para salvar.');
    }, 3000);
  };

  const handleDownload = (download: DownloadResult) => {
    // In production, this would trigger actual download
    toast.success(`Baixando ${download.title}.${download.format.split('-')[0]}...`);
  };

  const removeDownload = (id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Link className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Download de Mídias</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Baixe de{' '}
            <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              YouTube, TikTok
            </span>{' '}
            e mais
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cole a URL do vídeo e escolha o formato. Suportamos YouTube, TikTok, Instagram, Twitter e Facebook.
          </p>
        </div>

        {/* URL Input Form */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                />
              </div>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="w-full md:w-[200px] h-14 bg-background/50 border-border/50">
                  <SelectValue placeholder="Formato" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="h-14 px-8"
                disabled={isProcessing || !url.trim()}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {isProcessing ? 'Processando...' : 'Processar'}
              </Button>
            </div>

            {/* Supported Platforms */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <span className="text-sm text-muted-foreground">Plataformas suportadas:</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-sm">
                  <Youtube className="w-4 h-4" />
                  YouTube
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-500 text-sm">
                  <Video className="w-4 h-4" />
                  TikTok
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-500 text-sm">
                  <Video className="w-4 h-4" />
                  Instagram
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-sm">
                  <Video className="w-4 h-4" />
                  Twitter
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Downloads List */}
        {downloads.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Seus Downloads
            </h3>
            <div className="space-y-3">
              {downloads.map((download) => (
                <div
                  key={download.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/30"
                >
                  {getPlatformIcon(download.platform)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{download.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{download.url}</p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary uppercase">
                    {download.format.split('-')[0]}
                  </span>
                  
                  {download.status === 'processing' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Processando...</span>
                    </div>
                  )}
                  
                  {download.status === 'ready' && (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => handleDownload(download)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      Baixar
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDownload(download.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
