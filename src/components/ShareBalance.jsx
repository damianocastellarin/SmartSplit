import React from 'react';
import { Share2, FileText, MessageSquare, Download } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function ShareBalance({ isOpen, onClose, group, totalSpent, settlements, showAlert }) {
  
  // --- 1. CONDIVISIONE TESTO (WhatsApp, ecc.) ---
  const handleShareText = async () => {
    let text = `📊 *${group.name}*\n\n`;
    text += `💰 Totale Spese: ${totalSpent.toFixed(2)}€\n\n`;
    text += `*PIANO SALDI:*\n`;
    
    if (settlements.length === 0) {
      text += `✅ Nessun debito, siete in pari!\n`;
    } else {
      settlements.forEach(s => {
        text += `👉 ${s.from} deve ${s.amount.toFixed(2)}€ a ${s.to}\n`;
      });
    }

    // Tenta la condivisione nativa (Mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Riepilogo ${group.name}`,
          text: text,
        });
        onClose();
      } catch (err) {
        console.log('Condivisione annullata o fallita', err);
      }
    } else {
      // Fallback: Copia negli appunti (Desktop)
      navigator.clipboard.writeText(text);
      onClose();
      showAlert({
        title: "Copiato!",
        message: "Il riepilogo è stato copiato negli appunti.",
        type: "info"
      });
    }
  };

  // --- 2. GENERAZIONE E SCARICAMENTO PDF ---
  const handleSharePDF = () => {
    try {
      const doc = new jsPDF();

      // Titolo
      doc.setFontSize(20);
      doc.text(group.name, 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Totale Spese: ${totalSpent.toFixed(2)}€`, 14, 32);
      doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 14, 38);

      // Tabella Saldi
      if (settlements.length > 0) {
        const tableData = settlements.map(s => [
          s.from,
          s.to,
          `${s.amount.toFixed(2)} €`
        ]);

        doc.autoTable({
          startY: 45,
          head: [['Chi Paga (Debitore)', 'A Chi (Creditore)', 'Importo']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] }, // Colore primary Tailwind (#3B82F6)
        });
      } else {
        doc.text("Tutti i conti sono in pari!", 14, 50);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text('Generato con SmartSplit', 14, doc.internal.pageSize.height - 10);
      }

      // Salva il file
      doc.save(`Riepilogo_${group.name.replace(/\s+/g, '_')}.pdf`);
      
      onClose();
      showAlert({
        title: "PDF Scaricato",
        message: "Il file PDF è stato generato correttamente.",
        type: "info" // Usa 'confirm' se vuoi l'icona verde
      });

    } catch (error) {
      console.error("Errore generazione PDF:", error);
      onClose();
      showAlert({
        title: "Errore",
        message: "Impossibile generare il PDF. Assicurati di aver installato 'jspdf' e 'jspdf-autotable'.",
        type: "danger"
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Condividi Riepilogo">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Scegli come vuoi condividere il piano dei saldi per il gruppo <strong>{group.name}</strong>.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {/* Opzione 1: Messaggio Testuale */}
          <button 
            onClick={handleShareText}
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm group"
          >
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-900">Messaggio / WhatsApp</h4>
              <p className="text-xs text-slate-500">Invia il testo semplice con i calcoli</p>
            </div>
          </button>

          {/* Opzione 2: PDF */}
          <button 
            onClick={handleSharePDF}
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm group"
          >
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-900">Documento PDF</h4>
              <p className="text-xs text-slate-500">Scarica un file formattato e stampabile</p>
            </div>
          </button>
        </div>

        <div className="pt-2">
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Annulla
          </Button>
        </div>
      </div>
    </Modal>
  );
}