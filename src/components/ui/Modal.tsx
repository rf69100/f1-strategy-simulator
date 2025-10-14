import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}: ModalProps) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className={`bg-gray-800 rounded-xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 scale-100 opacity-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal spécialisé pour les stratégies F1
interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  team: string;
  children: ReactNode;
}

export const StrategyModal = ({ 
  isOpen, 
  onClose, 
  driverName, 
  team, 
  children 
}: StrategyModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stratégie de Course" size="lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{driverName}</h3>
        <p className="text-gray-300 text-sm">{team}</p>
      </div>
      {children}
    </Modal>
  );
};