import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GroupContext = createContext();

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroups deve essere usato dentro un GroupProvider');
  return context;
};

export const GroupProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Carica i gruppi dal localStorage (per ora simuliamo un DB locale)
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('smartsplit_groups');
    return saved ? JSON.parse(saved) : [];
  });

  // Salva ogni modifica
  useEffect(() => {
    localStorage.setItem('smartsplit_groups', JSON.stringify(groups));
  }, [groups]);

  // --- AZIONI ---

  const addGroup = (name, members) => {
    const newGroup = {
      id: crypto.randomUUID(),
      name,
      createdBy: user?.id || 'guest', // Importante: Collega il gruppo all'utente
      members,
      expenses: [],
      createdAt: new Date().toISOString(),
    };
    setGroups((prev) => [newGroup, ...prev]);
  };

  const deleteGroup = (id) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const getGroup = (id) => {
    return groups.find((g) => g.id === id);
  };

  // Funzioni spese invariate ma essenziali
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
      return {
        ...group,
        expenses: group.expenses.filter(e => e.id !== expenseId)
      };
    }));
  };

  const editExpense = (groupId, expenseId, updatedData) => {
    setGroups((prev) => prev.map(group => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        expenses: group.expenses.map(e => 
          e.id === expenseId ? { ...e, ...updatedData } : e
        )
      };
    }));
  };

  const editGroup = (id, newName) => {
    setGroups((prev) => prev.map((g) => 
      g.id === id ? { ...g, name: newName } : g
    ));
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
              newPaidBy = newPaidBy.map(p => 
                p.member === oldName ? { ...p, member: newName } : p
              );
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
    <GroupContext.Provider value={{ 
      groups, // Nota: In un'app reale filtreremmo i gruppi per user.id
      addGroup, 
      deleteGroup, 
      editGroup,
      updateGroupFull, 
      getGroup, 
      addExpense, 
      deleteExpense, 
      editExpense 
    }}>
      {children}
    </GroupContext.Provider>
  );
};