import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase'; // Assicurati che questo export esista in firebase.js
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  arrayUnion,
  getDocs 
} from 'firebase/firestore';

const GroupContext = createContext();

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroups deve essere usato dentro un GroupProvider');
  return context;
};

// Genera codice breve univoco
const generateShareCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const GroupProvider = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- SINCRONIZZAZIONE DATI ---
  useEffect(() => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    // MODALITÀ OSPITE: Usa LocalStorage
    if (user.isGuest) {
      const saved = localStorage.getItem(`smartsplit_groups_guest`);
      setGroups(saved ? JSON.parse(saved) : []);
      setLoading(false);
      return;
    }

    // MODALITÀ LOGGATO: Usa Firestore (Database Reale)
    // Ascolta solo i gruppi in cui l'utente è membro
    const q = query(
      collection(db, "groups"),
      where("membersIds", "array-contains", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordina per data (più recenti prima)
      groupsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setGroups(groupsData);
      setLoading(false);
    }, (error) => {
      console.error("Errore sync gruppi:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Salva su LocalStorage solo se ospite
  useEffect(() => {
    if (user?.isGuest) {
      localStorage.setItem(`smartsplit_groups_guest`, JSON.stringify(groups));
    }
  }, [groups, user]);

  // --- AZIONI ---

  const addGroup = async (name, memberNames) => {
    const newGroup = {
      name,
      shareCode: generateShareCode(),
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      members: memberNames, // Nomi visuali (es. ["Mario", "Luca"])
      membersIds: [user.id], // ID reali per i permessi (solo chi crea è membro all'inizio)
      expenses: []
    };

    if (user.isGuest) {
      setGroups(prev => [{ ...newGroup, id: crypto.randomUUID() }, ...prev]);
    } else {
      // Salva su Firestore
      await addDoc(collection(db, "groups"), newGroup);
    }
  };

  const joinGroup = async (code) => {
    if (user.isGuest) {
      alert("Devi registrarti per unirti a gruppi online.");
      return false;
    }

    try {
      // Cerca il gruppo con quel codice
      const q = query(collection(db, "groups"), where("shareCode", "==", code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return false;

      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();

      // Controlla se sei già dentro
      if (groupData.membersIds.includes(user.id)) return true;

      // Aggiungiti al gruppo
      await updateDoc(doc(db, "groups", groupDoc.id), {
        membersIds: arrayUnion(user.id),
        members: arrayUnion(user.name) // Aggiungi anche il tuo nome alla lista visuale
      });

      return true;
    } catch (error) {
      console.error("Errore join:", error);
      return false;
    }
  };

  const deleteGroup = async (groupId) => {
    if (user.isGuest) {
      setGroups(prev => prev.filter(g => g.id !== groupId));
    } else {
      await deleteDoc(doc(db, "groups", groupId));
    }
  };

  const getGroup = (id) => groups.find(g => g.id === id);

  // --- GESTIONE SPESE (Unificata) ---
  // Funzione helper per aggiornare un gruppo (locale o remoto)
  const _updateGroupData = async (groupId, updateFn) => {
    if (user.isGuest) {
      setGroups(prev => prev.map(g => g.id === groupId ? updateFn(g) : g));
    } else {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      const updatedGroup = updateFn(group);
      // Su Firestore aggiorniamo solo i campi cambiati
      await updateDoc(doc(db, "groups", groupId), {
        expenses: updatedGroup.expenses,
        members: updatedGroup.members // In caso cambino i membri
      });
    }
  };

  const addExpense = (groupId, expenseData) => {
    const newExpense = { ...expenseData, id: crypto.randomUUID(), date: new Date().toISOString() };
    _updateGroupData(groupId, (group) => ({
      ...group,
      expenses: [newExpense, ...group.expenses]
    }));
  };

  const deleteExpense = (groupId, expenseId) => {
    _updateGroupData(groupId, (group) => ({
      ...group,
      expenses: group.expenses.filter(e => e.id !== expenseId)
    }));
  };

  const editExpense = (groupId, expenseId, updatedData) => {
    _updateGroupData(groupId, (group) => ({
      ...group,
      expenses: group.expenses.map(e => e.id === expenseId ? { ...e, ...updatedData } : e)
    }));
  };

  const updateGroupFull = (groupId, newName, updatedMembers) => {
    // Logica complessa di rinomina membri mantenuta
    _updateGroupData(groupId, (group) => {
      let currentExpenses = [...group.expenses];
      const finalMemberList = [];

      updatedMembers.forEach(memberObj => {
        if (!memberObj.oldName) {
          finalMemberList.push(memberObj.newName);
          return;
        }
        const oldName = memberObj.oldName;
        const newName = memberObj.newName;
        finalMemberList.push(newName);

        if (oldName !== newName) {
          currentExpenses = currentExpenses.map(expense => {
            let newPaidBy = expense.paidBy;
            if (Array.isArray(newPaidBy)) {
              newPaidBy = newPaidBy.map(p => p.member === oldName ? { ...p, member: newName } : p);
            } else if (newPaidBy === oldName) {
              newPaidBy = newName;
            }
            return {
              ...expense,
              paidBy: newPaidBy,
              involvedMembers: expense.involvedMembers.map(m => m === oldName ? newName : m)
            };
          });
        }
      });

      // Nota: Aggiorniamo anche il nome del gruppo se serve, ma qui ritorniamo l'oggetto completo
      // Se vuoi aggiornare anche il nome del gruppo su Firestore, dovremmo passarlo separatamente,
      // ma per ora aggiorniamo tutto l'oggetto expenses/members che è il core.
      // Per il nome del gruppo serve un updateDoc separato se la struttura sopra non lo prevede,
      // ma _updateGroupData sovrascrive tutto quello che ritorna la funzione nel LocalState,
      // mentre su Firestore ho specificato solo expenses e members.
      // FIX: Aggiorniamo anche il nome su Firestore nel _updateGroupData
      
      return { ...group, name: newName, members: finalMemberList, expenses: currentExpenses };
    });
    
    // Patch veloce per il nome su Firestore se non è coperto da _updateGroupData standard
    if (!user.isGuest) {
      updateDoc(doc(db, "groups", groupId), { name: newName });
    }
  };

  return (
    <GroupContext.Provider value={{ 
      groups, loading, addGroup, joinGroup, deleteGroup, 
      getGroup, addExpense, deleteExpense, editExpense, updateGroupFull 
    }}>
      {children}
    </GroupContext.Provider>
  );
};