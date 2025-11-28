export function calculateGroupStats(group) {
  const balances = {};
  
  // 1. Inizializza tutti a 0
  group.members.forEach(member => {
    balances[member] = 0;
  });

  // 2. Itera su ogni spesa
  group.expenses.forEach(expense => {
    const amount = expense.amount;
    
    // Gestione Chi Partecipa (Debitori)
    const involved = (expense.involvedMembers && expense.involvedMembers.length > 0) 
      ? expense.involvedMembers 
      : group.members;

    if (involved.length === 0) return;

    // Calcolo quota debito
    const splitAmount = amount / involved.length;

    // A. GESTIONE CHI HA PAGATO (Creditori)
    if (Array.isArray(expense.paidBy)) {
      // CASO PAGAMENTO MULTIPLO (Nuovo)
      // expense.paidBy è tipo: [{member: "Mario", amount: 10}, {member: "Luca", amount: 20}]
      expense.paidBy.forEach(payment => {
        if (balances[payment.member] !== undefined) {
          balances[payment.member] += payment.amount;
        }
      });
    } else {
      // CASO PAGAMENTO SINGOLO (Vecchio/Compatibilità)
      const payer = expense.paidBy;
      if (balances[payer] !== undefined) {
        balances[payer] += amount;
      }
    }

    // B. GESTIONE CHI DEVE PAGARE (Debitori)
    involved.forEach(member => {
      if (balances[member] !== undefined) {
        balances[member] -= splitAmount;
      }
    });
  });

  return balances;
}

export function calculateSettlements(balances) {
  let debtors = [];
  let creditors = [];

  Object.entries(balances).forEach(([member, amount]) => {
    // Arrotondiamo per evitare problemi di virgola mobile
    const val = Math.round(amount * 100) / 100;
    if (val < -0.01) debtors.push({ member, amount: val });
    if (val > 0.01) creditors.push({ member, amount: val });
  });

  // Ordina per grandezza
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