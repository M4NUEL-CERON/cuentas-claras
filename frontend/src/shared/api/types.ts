// Shapes returned by the Spring Boot API. Amounts are in major units (90000 pesos, 12.5 dollars).

export type Member = { id: number; name: string }

export type Expense = {
  id: number
  description: string
  amount: number
  payerId: number
  participantIds: number[]
  createdAt: string
}

export type Balance = { memberId: number; paid: number; owed: number; net: number }

export type Transfer = { fromId: number; toId: number; amount: number }

export type Group = {
  code: string
  name: string
  currency: string
  total: number
  members: Member[]
  expenses: Expense[]
  balances: Balance[]
  settlements: Transfer[]
}

export type NewExpense = Pick<Expense, 'description' | 'amount' | 'payerId' | 'participantIds'>
