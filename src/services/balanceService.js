export function calculateGroupStats(group) {
  const balances = {};
  
  // 1. Inizializza tutti a 0
  group.members.forEach(member => {
    balances[member] = 0;
  });

  // 2. Itera su ogni spesa
  group.expenses.forEach(expense => {
    const payer = expense.paidBy;
    const amount = expense.amount;
    
    // MODIFICA: Usiamo involvedMembers se esiste, altrimenti tutti
    const involved = (expense.involvedMembers && expense.involvedMembers.length > 0) 
      ? expense.involvedMembers 
      : group.members;

    // Se nessuno è coinvolto (caso limite), ignora
    if (involved.length === 0) return;

    const splitAmount = amount / involved.length;

    // Chi ha pagato riceve un credito (+)
    // Nota: se il pagatore non è tra i coinvolti, riceve comunque il credito totale
    if (balances[payer] !== undefined) {
      balances[payer] += amount;
    }

    // Tutti quelli coinvolti contraggono un debito (-)
    involved.forEach(member => {
      if (balances[member] !== undefined) {
        balances[member] -= splitAmount;
      }
    });
  });

  return balances;
}

// Algoritmo ottimizzato (Resto invariato ma incluso per completezza)
export function calculateSettlements(balances) {
  let debtors = [];
  let creditors = [];

  Object.entries(balances).forEach(([member, amount]) => {
    const val = Math.round(amount * 100) / 100;
    if (val < -0.01) debtors.push({ member, amount: val });
    if (val > 0.01) creditors.push({ member, amount: val });
  });

  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0; 
  let j = 0; 

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

    settlements.push({
      from: debtor.member,
      to: creditor.member,
      amount: amount
    });

    debtor.amount += amount;
    creditor.amount -= amount;

    if (Math.abs(debtor.amount) < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}