import { useState, useRef } from 'react';
import { toast } from 'sonner';

type ImageUploaderProps = {
  images: { id: number; image_url: string; is_primary: boolean }[];
  productId: number;
  onUpload: (file: File) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
  onSetPrimary: (id: number) => Promise<any>;
};

export default function ImageUploader({ images, productId, onUpload, onDelete, onSetPrimary }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 15) {
      toast.error('You can upload a maximum of 15 images per product.');
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-sm text-slate-700">Product Images</label>
      <div className="mt-1 grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img src={image.image_url} alt="Product image" className="w-full h-24 object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onDelete(image.id)} className="text-white text-xs bg-red-600 px-2 py-1 rounded-md">Delete</button>
              {!image.is_primary && <button onClick={() => onSetPrimary(image.id)} className="text-white text-xs bg-blue-600 px-2 py-1 rounded-md ml-2">Primary</button>}
            </div>
            {image.is_primary && <div className="absolute top-1 right-1 text-xs bg-green-600 text-white px-2 py-1 rounded-md">Primary</div>}
          </div>
        ))}
        {images.length < 15 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50"
          >
            {uploading ? 'Uploading...' : 'Add Image'}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>
        )}
      </div>
    </div>
  );
}
