'use client';
import { ReactNode } from 'react';
import Modal from './Modal';
import Loading from './Loading';

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm, isPending }: { open: boolean; title: string; message: ReactNode; onCancel: () => void; onConfirm: () => void; isPending?: boolean }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="p-4 space-y-4">
        <div className="text-text">{message}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-border text-text hover:bg-gray-100 active:scale-[0.98] transition">Cancel</button>
          <button onClick={onConfirm} disabled={isPending} className="px-4 py-2 rounded-lg bg-brand text-white shadow hover:opacity-95 active:scale-[0.98] transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
            {isPending ? <Loading /> : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
