import React, { createContext, useContext, useState, useEffect } from 'react';

const GroupContext = createContext();

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroups deve essere usato dentro un GroupProvider');
  return context;
};

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('smartsplit_groups');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('smartsplit_groups', JSON.stringify(groups));
  }, [groups]);

  // --- AZIONI ---

  const addGroup = (name, members) => {
    const newGroup = {
      id: crypto.randomUUID(),
      name,
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

  // NUOVO: Elimina Spesa
  const deleteExpense = (groupId, expenseId) => {
    setGroups((prev) => prev.map(group => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        expenses: group.expenses.filter(e => e.id !== expenseId)
      };
    }));
  };

  // NUOVO: Modifica Spesa
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

  return (
    <GroupContext.Provider value={{ groups, addGroup, deleteGroup, getGroup, addExpense, deleteExpense, editExpense }}>
      {children}
    </GroupContext.Provider>
  );
};