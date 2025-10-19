import { useState } from 'react';
import { toast } from 'sonner';

type Variant = { id?: number; name: string; stock_quantity: number; image_url?: string };

type VariantManagerProps = {
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
  onUpload: (variant: Variant, file: File) => Promise<any>;
};

export default function VariantManager({ variants, onVariantsChange, onUpload }: VariantManagerProps) {
  const [newVariant, setNewVariant] = useState({ name: '', stock_quantity: 0 });

  function addVariant() {
    if (!newVariant.name || newVariant.stock_quantity <= 0) {
      toast.error('Please enter a valid name and stock for the variant.');
      return;
    }
    onVariantsChange([...variants, newVariant]);
    setNewVariant({ name: '', stock_quantity: 0 });
  }

  function updateVariant(index: number, updatedVariant: Variant) {
    const newVariants = [...variants];
    newVariants[index] = updatedVariant;
    onVariantsChange(newVariants);
  }

  function removeVariant(index: number) {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    onVariantsChange(newVariants);
  }

  return (
    <div>
      <label className="text-sm text-slate-700">Product Variants</label>
      {variants.map((variant, index) => (
        <div key={index} className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={variant.name}
            onChange={(e) => updateVariant(index, { ...variant, name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Variant Name"
          />
          <input
            type="number"
            value={variant.stock_quantity}
            onChange={(e) => updateVariant(index, { ...variant, stock_quantity: parseInt(e.target.value, 10) })}
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
          <button onClick={() => removeVariant(index)} className="text-red-600">Remove</button>
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
