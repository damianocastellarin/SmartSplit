import React from 'react';
import { FileText, MessageSquare } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

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

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Riepilogo ${group.name}`,
          text: text,
        });
        onClose();
      } catch (err) {
        console.log('Condivisione annullata', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      onClose();
      showAlert({
        title: "Copiato!",
        message: "Il riepilogo è stato copiato negli appunti.",
        type: "info"
      });
    }
  };

  // --- 2. METODO NATIVO "STAMPA / SALVA PDF" (NESSUNA LIBRERIA) ---
  const handleSharePDF = () => {
    // Creiamo il contenuto HTML per il PDF
    const printContent = `
      <div style="font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #1e293b; margin-bottom: 10px; font-size: 28px;">${group.name}</h1>
          <p style="color: #64748b;">Riepilogo Spese e Saldi</p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">Totale Spese Gruppo</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0f172a;">${totalSpent.toFixed(2)} €</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8; margin-top: 10px;">Generato il: ${new Date().toLocaleDateString('it-IT')}</p>
        </div>
        
        <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #334155;">Piano dei Saldi</h3>
        
        ${settlements.length === 0 
          ? '<p style="text-align: center; padding: 20px; color: #10b981; font-weight: bold;">✅ Tutti i conti sono in pari!</p>' 
          : `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left;">
                  <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569;">Chi Paga (Debitore)</th>
                  <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569;">A Chi (Creditore)</th>
                  <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569; text-align: right;">Importo</th>
                </tr>
              </thead>
              <tbody>
                ${settlements.map(s => `
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${s.from}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">
                      <span style="display: inline-flex; align-items: center;">
                        <span style="margin-right: 6px;">→</span> ${s.to}
                      </span>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a; text-align: right;">${s.amount.toFixed(2)} €</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `
        }
        
        <div style="margin-top: 60px; font-size: 12px; color: #cbd5e1; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
          Generato con SmartSplit
        </div>
      </div>
    `;

    // Apriamo una nuova finestra invisibile per la stampa
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Riepilogo ${group.name}</title>
          </head>
          <body style="margin: 0; -webkit-print-color-adjust: exact;">
            ${printContent}
            <script>
              // Aspetta che il contenuto sia caricato e poi stampa
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  // Su mobile, dopo la stampa (o annulla), l'utente chiuderà la tab manualmente
                  // Su desktop potremmo provare a chiuderla, ma spesso è bloccato
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      onClose();
    } else {
      showAlert({ 
        title: "Errore", 
        message: "Il browser ha bloccato l'apertura del PDF. Consenti i popup per questa app.", 
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

          {/* Opzione 2: PDF (Stampa Nativa) */}
          <button 
            onClick={handleSharePDF}
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm group"
          >
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-900">Salva come PDF</h4>
              <p className="text-xs text-slate-500">Genera un documento stampabile</p>
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