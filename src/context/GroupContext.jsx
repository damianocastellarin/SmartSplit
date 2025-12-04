import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase'; 
import { 
  collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc, arrayUnion, getDocs 
} from 'firebase/firestore';

const GroupContext = createContext();

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroups deve essere usato dentro un GroupProvider');
  return context;
};

// Genera codice breve
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

    // A. MODALITÀ OSPITE (Locale)
    if (user.isGuest) {
      const saved = localStorage.getItem(`smartsplit_groups_guest`);
      setGroups(saved ? JSON.parse(saved) : []);
      setLoading(false);
      return;
    }

    // B. MODALITÀ LOGGATO (Firestore - Online)
    // Scarica solo i gruppi dove l'utente è membro
    const q = query(
      collection(db, "groups"),
      where("membersIds", "array-contains", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordina per data creazione
      groupsData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setGroups(groupsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Salva in locale solo se ospite
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
      members: memberNames,
      membersIds: [user.id], // Importante per i permessi
      expenses: []
    };

    if (user.isGuest) {
      setGroups(prev => [{ ...newGroup, id: crypto.randomUUID() }, ...prev]);
    } else {
      await addDoc(collection(db, "groups"), newGroup);
    }
  };

  const joinGroup = async (code) => {
    if (user.isGuest) {
      alert("Devi registrarti per unirti ai gruppi online.");
      return false;
    }
    try {
      const q = query(collection(db, "groups"), where("shareCode", "==", code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return false;

      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();

      // Se sei già dentro, ritorna true
      if (groupData.membersIds.includes(user.id)) return true;

      // Aggiungiti al gruppo
      await updateDoc(doc(db, "groups", groupDoc.id), {
        membersIds: arrayUnion(user.id),
        members: arrayUnion(user.name) 
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

  // Helper per aggiornare un gruppo (gestisce sia locale che cloud)
  const _updateGroup = async (groupId, changes) => {
    if (user.isGuest) {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...changes } : g));
    } else {
      await updateDoc(doc(db, "groups", groupId), changes);
    }
  };

  // Le funzioni di modifica devono calcolare l'intero nuovo array di spese
  // perché su Firestore aggiorniamo l'intero campo 'expenses'
  const addExpense = (groupId, expenseData) => {
    const group = getGroup(groupId);
    if (!group) return;
    const newExpense = { ...expenseData, id: crypto.randomUUID(), date: new Date().toISOString() };
    _updateGroup(groupId, { expenses: [newExpense, ...group.expenses] });
  };

  const deleteExpense = (groupId, expenseId) => {
    const group = getGroup(groupId);
    if (!group) return;
    _updateGroup(groupId, { expenses: group.expenses.filter(e => e.id !== expenseId) });
  };

  const editExpense = (groupId, expenseId, updatedData) => {
    const group = getGroup(groupId);
    if (!group) return;
    const updatedExpenses = group.expenses.map(e => e.id === expenseId ? { ...e, ...updatedData } : e);
    _updateGroup(groupId, { expenses: updatedExpenses });
  };

  const updateGroupFull = (groupId, newName, updatedMembers) => {
    const group = getGroup(groupId);
    if (!group) return;

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

    _updateGroup(groupId, { 
      name: newName, 
      members: finalMemberList, 
      expenses: currentExpenses 
    });
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