import { useState } from 'react';
import { toast } from 'sonner';

type Variant = { id?: number; name: string; stock_quantity: number; image_url?: string };

type VariantManagerProps = {
  productId: number;
  variants: Variant[];
  onCreate: (variant: Omit<Variant, 'id'>) => Promise<any>;
  onUpdate: (variant: Variant) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
  onUpload: (variant: Variant, file: File) => Promise<any>;
};

export default function VariantManager({ productId, variants, onCreate, onUpdate, onDelete, onUpload }: VariantManagerProps) {
  const [newVariant, setNewVariant] = useState({ name: '', stock_quantity: 0 });

  function addVariant() {
    if (!newVariant.name || newVariant.stock_quantity <= 0) {
      toast.error('Please enter a valid name and stock for the variant.');
      return;
    }
    onCreate(newVariant);
    setNewVariant({ name: '', stock_quantity: 0 });
  }

  function removeVariant(id?: number) {
    if (id) {
      onDelete(id);
    }
  }

  return (
    <div>
      <label className="text-sm text-slate-700">Product Variants</label>
      {variants.map((variant) => (
        <div key={variant.id} className="flex items-center gap-2 mt-2">
          <input
            type="text"
            defaultValue={variant.name}
            onBlur={(e) => onUpdate({ ...variant, name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Variant Name"
          />
          <input
            type="number"
            defaultValue={variant.stock_quantity}
            onBlur={(e) => onUpdate({ ...variant, stock_quantity: parseInt(e.target.value, 10) })}
            className="w-32 rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Stock"
          />
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onUpload(variant, e.target.files[0]);
              }
            }}
            className="w-32"
          />
          <button onClick={() => removeVariant(variant.id)} className="text-red-600">Remove</button>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="text"
          value={newVariant.name}
          onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Variant Name"
        />
        <input
          type="number"
          value={newVariant.stock_quantity}
          onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: parseInt(e.target.value, 10) })}
          className="w-32 rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Stock"
        />
        <button onClick={addVariant} className="brand-bg text-white px-4 py-2 rounded-lg">Add</button>
      </div>
    </div>
  );
}
