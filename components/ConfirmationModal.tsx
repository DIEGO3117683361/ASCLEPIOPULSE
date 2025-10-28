import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
    >
      <div 
        className="bg-graphite-light rounded-lg p-6 w-full max-w-sm border border-graphite-lighter shadow-xl text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
            <AlertTriangle className="h-6 w-6 text-red-400" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-white mt-4">{title}</h3>
        <p className="text-sm text-gray-400 mt-2 mb-6">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row sm:gap-3 gap-2">
          <button
            type="button"
            className="w-full justify-center rounded-md bg-graphite-lighter px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-graphite-lighter/80"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
