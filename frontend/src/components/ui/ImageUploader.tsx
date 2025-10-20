'use client';
import { useState, useRef, DragEvent } from 'react';
import { toast } from 'sonner';
import { UploadCloud, Trash2, Star } from 'lucide-react';

type ImageUploaderProps = {
  images: { id: number; image_url: string; is_primary: boolean }[];
  onUpload: (files: File[]) => void;
  onDelete: (id: number) => void;
  onSetPrimary: (id: number) => void;
};

export default function ImageUploader({ images, onUpload, onDelete, onSetPrimary }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('No valid image files selected.');
      return;
    }

    if (images.length + imageFiles.length > 15) {
      toast.error(`You can upload a maximum of 15 images. You are trying to upload ${imageFiles.length} files.`);
      return;
    }

    setUploading(true);
    try {
      await onUpload(imageFiles);
    } catch (error) {
        toast.error('An error occurred during upload.');
    } finally {
      setUploading(false);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    handleFileUpload(e.target.files);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
    }
    setIsDragging(false);
  };

  return (
    <div>
        <h3 className="text-lg font-medium text-text mb-2">Product Images</h3>
        <div
          className={`p-4 border-2 border-dashed rounded-lg transition-colors ${isDragging ? 'border-brand bg-brand-light' : 'border-border'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div key={image.id} className="group relative aspect-square">
                <img src={image.image_url} alt="Product" className="w-full h-full object-cover rounded-lg" />
                {image.is_primary && <div className="absolute top-1 right-1 text-xs bg-brand text-white px-2 py-1 rounded-md z-10">Primary</div>}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!image.is_primary && (
                        <button type="button" onClick={() => onSetPrimary(image.id)} className="p-2 rounded-full bg-white/80 hover:bg-white">
                            <Star size={16} />
                        </button>
                    )}
                    <button type="button" onClick={() => onDelete(image.id)} className="p-2 rounded-full bg-white/80 hover:bg-white text-red-500">
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
            ))}
            {images.length < 15 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 text-gray-500 transition-colors"
              >
                {uploading ? (
                  'Uploading...'
                ) : (
                  <>
                    <UploadCloud size={32} className="mb-2" />
                    <span className="text-center text-sm">Upload or drop files</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" multiple />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-4">You can upload up to 15 images. Drag and drop is supported.</p>
        </div>
    </div>
  );
}
