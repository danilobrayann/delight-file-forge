import { useState, useCallback } from "react";
import { Upload, FileText, Image, Video, Music, X, Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface UploadedFile {
  file: File;
  id: string;
  type: 'document' | 'image' | 'video' | 'audio';
  preview?: string;
  converted?: boolean;
  convertedFormat?: string;
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
    setFiles(prev => prev.filter(f => f.id !== id));
    setSelectedFormat(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const handleConvert = async (fileItem: UploadedFile) => {
    setConverting(fileItem.id);
    
    // Simulate conversion process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mark file as converted
    setFiles(prev => prev.map(f => 
      f.id === fileItem.id 
        ? { ...f, converted: true, convertedFormat: selectedFormat[fileItem.id] }
        : f
    ));
    
    setConverting(null);
    toast.success(`Arquivo convertido para ${selectedFormat[fileItem.id]}! Clique em "Baixar" para salvar.`);
  };

  const handleDownload = (fileItem: UploadedFile) => {
    const format = fileItem.convertedFormat || selectedFormat[fileItem.id];
    const originalName = fileItem.file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const newFileName = `${nameWithoutExt}.${format.toLowerCase()}`;
    
    // Create a blob from the original file (simulating converted file)
    const blob = new Blob([fileItem.file], { type: fileItem.file.type });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`${newFileName} baixado com sucesso!`);
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
          <h3 className="text-lg font-semibold text-foreground">Arquivos ({files.length})</h3>
          
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
                    {fileItem.converted ? (
                      <Button 
                        variant="gradient" 
                        size="sm"
                        onClick={() => handleDownload(fileItem)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4" />
                        Baixar
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
