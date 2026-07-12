export type AccountType =
  | 'CASH'
  | 'BANK'
  | 'WALLET'
  | 'CREDIT_CARD'
  | 'INVESTMENT'
  | 'OTHER';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  icon: string | null;
  color: string | null;
  balance: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountBalanceHistoryPoint {
  id: string;
  accountId: string;
  balance: number;
  recordedAt: string;
}

