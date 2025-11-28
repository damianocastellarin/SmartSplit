import React from 'react';
import { AlertTriangle, Check, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '../../utils/cn';

/**
 * Componente per mostrare alert e conferme in stile mobile.
 * * @param {boolean} isOpen - Se la modale è aperta
 * @param {function} onClose - Funzione per chiudere la modale
 * @param {string} title - Titolo dell'alert
 * @param {string} message - Messaggio descrittivo
 * @param {'info' | 'confirm' | 'danger'} type - Tipo di alert (cambia colori e icone)
 * @param {string} confirmText - Testo del bottone di conferma
 * @param {string} cancelText - Testo del bottone di annulla
 * @param {function} onConfirm - Funzione da eseguire alla conferma
 */
export function AlertDialog({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  confirmText = 'Ok', 
  cancelText = 'Annulla', 
  onConfirm 
}) {
  
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  // Configurazione stili in base al tipo
  const styles = {
    danger: {
      bg: "bg-red-50",
      text: "text-danger",
      icon: <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />,
      btn: "bg-danger hover:bg-red-600"
    },
    confirm: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      icon: <Check className="w-5 h-5 shrink-0 mt-0.5" />,
      btn: "bg-emerald-600 hover:bg-emerald-700"
    },
    info: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      icon: <Info className="w-5 h-5 shrink-0 mt-0.5" />,
      btn: "bg-primary"
    }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className={cn("p-4 rounded-lg flex items-start gap-3", currentStyle.bg, currentStyle.text)}>
          {currentStyle.icon}
          <p className="text-sm leading-relaxed font-medium opacity-90">{message}</p>
        </div>

        <div className="flex gap-3 pt-2">
          {/* Mostra bottone Annulla solo se non è un semplice info */}
          {type !== 'info' && (
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              {cancelText}
            </Button>
          )}
          
          <Button 
            className={cn("flex-1 text-white shadow-sm", currentStyle.btn)} 
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}