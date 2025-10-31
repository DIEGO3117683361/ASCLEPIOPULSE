import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [pin, setPin] = useState('');

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    if (pin.length === 4) {
      onConfirm(pin);
    }
  };
  
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    if (value.length <= 4) {
      setPin(value);
    }
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
          <ShieldAlert className="h-6 w-6 text-red-400" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-white mt-4">Confirmación Requerida</h3>
        <p className="text-sm text-gray-400 mt-2 mb-4">
          Esta acción es irreversible. Para confirmar, por favor ingresa tu PIN de 4 dígitos.
        </p>
        
        <input
          type="password"
          value={pin}
          onChange={handlePinChange}
          maxLength={4}
          className="w-full bg-graphite border border-graphite-lighter rounded-lg py-3 px-4 text-white text-center text-2xl tracking-[1em]"
          placeholder="----"
        />

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:gap-3 gap-2">
          <button
            type="button"
            className="w-full justify-center rounded-md bg-graphite-lighter px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-graphite-lighter/80"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:bg-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={handleConfirmClick}
            disabled={pin.length !== 4}
          >
            Eliminar Cuenta Permanentemente
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
