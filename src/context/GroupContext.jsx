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

  // --- AZIONI BASE ---

  const addGroup = (name, members) => {
    const newGroup = {
      id: crypto.randomUUID(),
      name,
      members, // Array di stringhe ['Mario', 'Luigi']
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

  // --- GESTIONE SPESE ---

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

  // --- GESTIONE AVANZATA GRUPPO (UPDATE FULL) ---
  
  const updateGroupFull = (groupId, newName, updatedMembers) => {
    setGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;

      let currentExpenses = [...group.expenses];
      const finalMemberList = [];

      updatedMembers.forEach(memberObj => {
        // È un nuovo membro?
        if (!memberObj.oldName) {
          finalMemberList.push(memberObj.newName);
          return;
        }

        const oldName = memberObj.oldName;
        const newName = memberObj.newName;
        finalMemberList.push(newName);

        if (oldName !== newName) {
          // AGGIORNAMENTO STORICO
          currentExpenses = currentExpenses.map(expense => {
            // Aggiorna 'paidBy'
            let newPaidBy = expense.paidBy;
            
            // Se paidBy è un Array (Pagamento Multiplo)
            if (Array.isArray(newPaidBy)) {
              newPaidBy = newPaidBy.map(p => 
                p.member === oldName ? { ...p, member: newName } : p
              );
            } 
            // Se paidBy è una Stringa (Pagamento Singolo Vecchio)
            else if (newPaidBy === oldName) {
              newPaidBy = newName;
            }

            return {
              ...expense,
              paidBy: newPaidBy,
              // Aggiorna array 'involvedMembers'
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
      groups, 
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