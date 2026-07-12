import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useTransaction } from '@/hooks/queries/useTransactions';
import type { TransactionType } from '@/types/transaction.types';

export function TransactionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const isEdit = Boolean(id);
  const initialType = (searchParams.get('type') as TransactionType) || 'EXPENSE';

  const { data: transaction, isLoading, isError } = useTransaction(id ?? '');

  if (isEdit && isLoading) {
    return <div className="text-sm text-text-secondary">Loading transaction…</div>;
  }

  if (isEdit && (isError || !transaction)) {
    return <div className="text-sm text-danger">Transaction not found.</div>;
  }

  return (
    <TransactionForm
      mode={isEdit ? 'edit' : 'create'}
      initialType={initialType}
      transaction={transaction}
      onCancel={() => navigate(-1)}
      onSuccess={() => {
        toast.success(isEdit ? 'Transaction updated' : 'Transaction added');
        navigate(isEdit ? '/transactions' : '/');
      }}
    />
  );
}
