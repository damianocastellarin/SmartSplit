import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { useGroups } from '../context/GroupContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export default function CreateGroup() {
  const navigate = useNavigate();
  const { addGroup } = useGroups();
  
  // Stato del form
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState(['', '']); 
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestione modifica nome membro
  const handleMemberChange = (index, value) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
    
    // Pulisci errore specifico se l'utente sta scrivendo
    if (errors[`member_${index}`]) {
      setErrors(prev => ({ ...prev, [`member_${index}`]: null }));
    }
    // Pulisci errore generale
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: null }));
    }
  };

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const removeMemberField = (index) => {
    if (members.length <= 2) return; 
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
  };

  // Validazione e Salvataggio
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // 1. Validazione Nome Gruppo
    if (!groupName.trim()) {
      newErrors.name = "Il nome del gruppo è obbligatorio";
    }

    // 2. Filtra i membri vuoti
    const validMembers = members.map(m => m.trim()).filter(m => m !== '');

    // 3. Controllo numero minimo
    if (validMembers.length < 2) {
      newErrors.general = "Servono almeno 2 persone per un gruppo.";
    }

    // 4. CONTROLLO DUPLICATI (FIX BUG)
    // Creiamo un array di nomi minuscoli per controllare "Mario" vs "mario"
    const lowerCaseNames = validMembers.map(name => name.toLowerCase());
    const hasDuplicates = lowerCaseNames.some((name, index) => lowerCaseNames.indexOf(name) !== index);

    if (hasDuplicates) {
      newErrors.general = "Non puoi inserire due o più partecipanti con lo stesso nome.";
    }

    // Controlla campi vuoti specifici (estetico)
    members.forEach((member, index) => {
      if (!member.trim()) {
        newErrors[`member_${index}`] = "Inserisci un nome";
      }
    });

    // Se ci sono errori, fermati
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      addGroup(groupName, validMembers);
      setIsSubmitting(false);
      navigate('/'); 
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Nuovo Gruppo</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dettagli Gruppo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <Input 
            label="Nome del Gruppo" 
            placeholder="Es. Vacanza in Grecia" 
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: null }));
            }}
            error={errors.name}
          />

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Partecipanti</label>
            
            {members.map((member, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input 
                  placeholder={`Nome persona ${index + 1}`}
                  value={member}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  error={errors[`member_${index}`]}
                  className="flex-1"
                />
                <Button 
                  type="button" variant="ghost" size="icon"
                  onClick={() => removeMemberField(index)}
                  disabled={members.length <= 2}
                  className="mt-[2px] text-slate-400 hover:text-danger"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}

            {/* Visualizzazione Errore Generale (Duplicati) */}
            {errors.general && (
              <div className="bg-red-50 text-danger p-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errors.general}
              </div>
            )}

            <Button 
              type="button" variant="secondary" onClick={addMemberField}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" /> Aggiungi altra persona
            </Button>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => navigate('/')}>
              Annulla
            </Button>
            <Button className="flex-1" onClick={handleSubmit} isLoading={isSubmitting}>
              <Save className="w-4 h-4 mr-2" /> Crea Gruppo
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}