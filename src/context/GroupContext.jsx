import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GroupContext = createContext();

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroups deve essere usato dentro un GroupProvider');
  return context;
};

// Helper per generare codici brevi
const generateShareCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const GroupProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('smartsplit_groups');
    let loadedGroups = saved ? JSON.parse(saved) : [];

    // --- AUTO-MIGRAZIONE (FIX PER GRUPPI VECCHI) ---
    // Se un gruppo non ha shareCode o createdBy, li aggiungiamo ora.
    loadedGroups = loadedGroups.map(group => ({
      ...group,
      // Se manca il codice, ne generiamo uno
      shareCode: group.shareCode || generateShareCode(),
      // Se manca il creatore, lo marchiamo come 'legacy' (o lo assegnamo all'utente corrente se c'è)
      createdBy: group.createdBy || 'legacy' 
    }));

    return loadedGroups;
  });

  useEffect(() => {
    localStorage.setItem('smartsplit_groups', JSON.stringify(groups));
  }, [groups]);

  // --- AZIONI ---

  const addGroup = (name, members) => {
    const newGroup = {
      id: crypto.randomUUID(),
      shareCode: generateShareCode(),
      createdBy: user?.id || 'guest',
      name,
      members, 
      expenses: [],
      createdAt: new Date().toISOString(),
    };
    setGroups((prev) => [newGroup, ...prev]);
  };

  const joinGroup = (code) => {
    const targetGroup = groups.find(g => g.shareCode === code);
    return !!targetGroup; 
  };

  const deleteGroup = (id) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const getGroup = (id) => {
    return groups.find((g) => g.id === id);
  };

  const addExpense = (groupId, expenseData) => {
    setGroups((prev) => prev.map(group => {
      if (group.id !== groupId) return group;
      const newExpense = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        ...expenseData 
      };
      return { ...group, expenses: [newExpense, ...group.expenses] };
    }));
  };

  const deleteExpense = (groupId, expenseId) => {
    setGroups((prev) => prev.map(group => {
      if (group.id !== groupId) return group;
      return { ...group, expenses: group.expenses.filter(e => e.id !== expenseId) };
    }));
  };

  const editExpense = (groupId, expenseId, updatedData) => {
    setGroups((prev) => prev.map(group => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        expenses: group.expenses.map(e => e.id === expenseId ? { ...e, ...updatedData } : e)
      };
    }));
  };

  const updateGroupFull = (groupId, newName, updatedMembers) => {
    setGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;

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

      return {
        ...group,
        name: newName,
        members: finalMemberList,
        expenses: currentExpenses
      };
    }));
  };

  return (
    <GroupContext.Provider value={{ groups, addGroup, joinGroup, deleteGroup, updateGroupFull, getGroup, addExpense, deleteExpense, editExpense }}>
      {children}
    </GroupContext.Provider>
  );
};