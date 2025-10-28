import React from 'react';
import { X } from 'lucide-react';
import { STICKERS } from '../data/stickers';

interface StickerPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (stickerUrl: string) => void;
}

const StickerPicker: React.FC<StickerPickerProps> = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    const handleSelect = (url: string) => {
        onSelect(url);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-graphite-light rounded-lg p-4 w-full max-w-sm border border-graphite-lighter shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Elige un Sticker</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {STICKERS.map((stickerUrl) => (
                        <button 
                            key={stickerUrl} 
                            onClick={() => handleSelect(stickerUrl)} 
                            className="bg-graphite-lighter p-2 rounded-lg hover:bg-accent-lime/20 transition"
                        >
                            <img src={stickerUrl} alt="sticker" className="w-full h-full" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StickerPicker;
