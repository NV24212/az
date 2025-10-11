import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-3xl' }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[999] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-brand-sidebar border border-brand-border rounded-20 shadow-card w-full ${maxWidth} m-auto flex flex-col max-h-[90vh] animate-modal-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-brand-border">
          <h2 className="text-xl font-bold text-brand-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-brand-text-secondary hover:text-brand-text transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow text-brand-text">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
