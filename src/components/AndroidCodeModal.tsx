import React from 'react';
import { AndroidCodeViewer } from './AndroidCodeViewer';
import { X } from 'lucide-react';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-[#2A2D35]/80 hover:bg-[#3A3E4A] text-[#E0E0E0] hover:text-white transition-colors cursor-pointer border border-[#3A3E4A]"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>
        <AndroidCodeViewer onClose={onClose} />
      </div>
    </div>
  );
};
