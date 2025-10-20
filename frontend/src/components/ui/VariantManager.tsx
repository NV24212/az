'use client';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Trash2 } from 'lucide-react';

type Variant = { id?: number; name: string; stock_quantity: number; image_url?: string };

type VariantManagerProps = {
  variants: Variant[];
  onCreate: (variant: Omit<Variant, 'id' | 'image_url'>) => void;
  onUpdate: (variant: Variant) => void;
  onDelete: (id: number) => void;
  onUpload: (variant: Variant, file: File) => void;
};

export default function VariantManager({ variants, onCreate, onUpdate, onDelete, onUpload }: VariantManagerProps) {
  const [newVariant, setNewVariant] = useState({ name: '', stock_quantity: 0 });

  function addVariant() {
    if (!newVariant.name.trim() || newVariant.stock_quantity <= 0) {
      toast.error('Please enter a valid name and stock for the variant.');
      return;
    }
    onCreate(newVariant);
    setNewVariant({ name: '', stock_quantity: 0 });
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-text">Product Variants</h3>
      <div className="space-y-3">
        {variants.map((variant) => (
          <VariantEditor
            key={variant.id}
            variant={variant}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onUpload={onUpload}
          />
        ))}
      </div>
      <div className="p-4 border border-border rounded-lg">
        <h4 className="font-medium text-text mb-2">Add New Variant</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className='text-sm font-medium text-text'>Variant Name</label>
                <input
                    type="text"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="e.g., Red, Large"
                />
            </div>
            <div>
                <label className='text-sm font-medium text-text'>Stock Quantity</label>
                <input
                    type="number"
                    value={newVariant.stock_quantity}
                    onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: parseInt(e.target.value, 10) || 0 })}
                    onFocus={handleFocus}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="e.g. 10"
                />
            </div>
        </div>
        <div className="flex justify-end mt-4">
            <button onClick={addVariant} className="bg-brand text-white px-4 py-2 rounded-lg font-semibold hover:opacity-95 active:scale-[0.98] transition-all whitespace-nowrap">Add Variant</button>
        </div>
      </div>
    </div>
  );
}

function VariantEditor({ variant, onUpdate, onDelete, onUpload }: { variant: Variant, onUpdate: (v: Variant) => void, onDelete: (id: number) => void, onUpload: (v: Variant, f: File) => void }) {
    const [name, setName] = useState(variant.name);
    const [stock, setStock] = useState(variant.stock_quantity);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdate = () => {
        if (!name.trim() || stock < 0) {
            toast.error('Variant name and stock cannot be empty.');
            return;
        }
        if (name !== variant.name || stock !== variant.stock_quantity) {
            onUpdate({ ...variant, name, stock_quantity: stock });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(variant, file);
        }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === '0') {
          e.target.value = '';
        }
    }

    return (
        <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <div
                className="w-16 h-16 rounded-md border border-border flex items-center justify-center bg-gray-100 cursor-pointer hover:bg-gray-200"
                onClick={() => fileInputRef.current?.click()}
            >
                {variant.image_url ? (
                    <img src={variant.image_url} alt={variant.name} className="w-full h-full object-cover rounded-md" />
                ) : (
                    <ImagePlus size={24} className="text-gray-400" />
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
            <div className="flex-grow grid grid-cols-2 gap-3">
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={handleUpdate}
                    className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="Variant Name"
                />
                <input
                    type="number"
                    value={stock}
                    onChange={e => setStock(parseInt(e.target.value, 10) || 0)}
                    onBlur={handleUpdate}
                    onFocus={handleFocus}
                    className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="Stock"
                />
            </div>
            <button
              onClick={() => {
                if(variant.id) onDelete(variant.id)
                else toast.error("Cannot delete an unsaved variant")
              }}
              className="p-2 rounded-md hover:bg-red-50 text-red-500"
            >
                <Trash2 size={16} />
            </button>
        </div>
    )
}
