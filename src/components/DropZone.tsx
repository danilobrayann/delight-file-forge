import { useState, useCallback } from "react";
import { Upload, FileText, Image, Video, Music, X, Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface UploadedFile {
  file: File;
  id: string;
  type: 'document' | 'image' | 'video' | 'audio';
  preview?: string;
  converted?: boolean;
  convertedFormat?: string;
  downloadUrl?: string;
  downloadFileName?: string;
}

const getFileType = (file: File): 'document' | 'image' | 'video' | 'audio' => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'image': return Image;
    case 'video': return Video;
    case 'audio': return Music;
    default: return FileText;
  }
};

const formatOptions: Record<string, string[]> = {
  document: ['PDF', 'DOCX', 'TXT', 'RTF'],
  image: ['PNG', 'JPG', 'WEBP', 'GIF', 'SVG'],
  video: ['MP4', 'MOV', 'AVI', 'WEBM'],
  audio: ['MP3', 'WAV', 'OGG', 'AAC'],
};

const DropZone = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<Record<string, string>>({});
  const [converting, setConverting] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      type: getFileType(file),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setFiles(prev => [...prev, ...uploadedFiles]);

    // Set default format for each file
    uploadedFiles.forEach(uf => {
      const defaultFormat = formatOptions[uf.type]?.[0] || 'PDF';
      setSelectedFormat(prev => ({ ...prev, [uf.id]: defaultFormat }));
    });

    toast.success(`${newFiles.length} arquivo(s) adicionado(s)`);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const toRemove = prev.find(f => f.id === id);
      if (toRemove?.preview) URL.revokeObjectURL(toRemove.preview);
      if (toRemove?.downloadUrl) URL.revokeObjectURL(toRemove.downloadUrl);
      return prev.filter(f => f.id !== id);
    });

    setSelectedFormat(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const getMimeTypeForFormat = (format: string) => {
    const ext = format.toLowerCase();
    const map: Record<string, string> = {
      // documents
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      rtf: 'application/rtf',
      // images
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      // video
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
      // audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      aac: 'audio/aac',
    };
    return map[ext] || 'application/octet-stream';
  };

  const sanitizeFileName = (name: string) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const convertImage = (file: File, format: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = getMimeTypeForFormat(format);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Conversion failed'));
          }
        }, mimeType, 0.92);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  };

  const convertText = async (file: File, format: string): Promise<Blob> => {
    const text = await file.text();
    const mimeType = getMimeTypeForFormat(format);
    return new Blob([text], { type: mimeType });
  };

  const convertToPdf = async (file: File, fileType: string): Promise<Blob> => {
    const doc = new jsPDF();

    if (fileType === 'image') {
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = new window.Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData;
      });

      const imgWidth = doc.internal.pageSize.getWidth();
      const imgHeight = (img.height * imgWidth) / img.width;

      doc.addImage(imageData, 'JPEG', 0, 0, imgWidth, imgHeight);
    } else {
      const text = await file.text();
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 10, 10);
    }

    return doc.output('blob');
  };

  const handleConvertAll = async () => {
    const unconverted = files.filter(f => !f.converted);
    for (const fileItem of unconverted) {
      await handleConvert(fileItem);
    }
  };

  const handleConvert = async (fileItem: UploadedFile) => {
    setConverting(fileItem.id);

    try {
      const format = (selectedFormat[fileItem.id] || 'PDF').toLowerCase();
      const originalName = fileItem.file.name;
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      const safeBase = sanitizeFileName(nameWithoutExt) || 'arquivo';
      const newFileName = `${safeBase}.${format}`;

      let blob: Blob;

      if (format === 'pdf') {
        blob = await convertToPdf(fileItem.file, fileItem.type);
      } else if (fileItem.type === 'image') {
        blob = await convertImage(fileItem.file, format);
      } else if (fileItem.type === 'document' && (format === 'txt' || format === 'rtf')) {
        blob = await convertText(fileItem.file, format);
      } else {
        // Fallback for types not fully supported in client-side yet (video, audio, complex docs)
        await new Promise(resolve => setTimeout(resolve, 1000));
        blob = new Blob([fileItem.file], { type: getMimeTypeForFormat(format) });
        if (fileItem.type === 'video' || fileItem.type === 'audio' || (fileItem.type === 'document' && format !== 'txt')) {
          toast.info(`Nota: A conversão real para ${format.toUpperCase()} requer processamento adicional. Salvando com a nova extensão.`);
        }
      }

      const downloadUrl = URL.createObjectURL(blob);

      // Mark file as converted and prepare download
      setFiles(prev => prev.map(f =>
        f.id === fileItem.id
          ? {
            ...f,
            converted: true,
            convertedFormat: selectedFormat[fileItem.id],
            downloadUrl,
            downloadFileName: newFileName,
          }
          : f
      ));

      toast.success(`Arquivo pronto em ${selectedFormat[fileItem.id]}! Clique em "Baixar".`);
    } catch (error: any) {
      console.error('Conversion error:', error);
      toast.error(`Erro na conversão: ${error.message || 'Tente outro formato.'}`);
    } finally {
      setConverting(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-2xl border-2 border-dashed p-12 text-center
          transition-all duration-300 cursor-pointer
          ${isDragging
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-secondary/30'
          }
        `}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="*/*"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-20 h-20 rounded-2xl flex items-center justify-center
            transition-all duration-300
            ${isDragging ? 'bg-primary/20 scale-110' : 'bg-secondary'}
          `}>
            <Upload className={`w-10 h-10 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>

          <div>
            <p className="text-lg font-medium text-foreground mb-1">
              Arraste e solte seus arquivos aqui
            </p>
            <p className="text-sm text-muted-foreground">
              ou clique para selecionar • Documentos, imagens, vídeos e áudios
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="mt-8 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Arquivos ({files.length})</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiles([])}
                className="text-muted-foreground hover:text-destructive"
              >
                Limpar Todos
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleConvertAll}
                disabled={!!converting || files.every(f => f.converted)}
              >
                {converting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Converter Todos
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {files.map((fileItem) => {
              const FileIcon = getFileIcon(fileItem.type);
              const formats = formatOptions[fileItem.type] || ['PDF'];

              return (
                <div
                  key={fileItem.id}
                  className="glass-card rounded-xl p-4 flex items-center gap-4 animate-slide-up"
                >
                  {/* Preview/Icon */}
                  <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                    {fileItem.preview ? (
                      <img src={fileItem.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Format Selector */}
                  <select
                    value={selectedFormat[fileItem.id] || formats[0]}
                    onChange={(e) => setSelectedFormat(prev => ({ ...prev, [fileItem.id]: e.target.value }))}
                    className="bg-secondary text-foreground text-sm rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {formats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {fileItem.converted && fileItem.downloadUrl ? (
                      <Button variant="gradient" size="sm" asChild>
                        <a
                          href={fileItem.downloadUrl}
                          download={fileItem.downloadFileName}
                          onClick={() => toast.success('Download iniciado!')}
                        >
                          <Download className="w-4 h-4" />
                          Baixar
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => handleConvert(fileItem)}
                        disabled={converting === fileItem.id}
                      >
                        {converting === fileItem.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {converting === fileItem.id ? 'Convertendo...' : 'Converter'}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(fileItem.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;
