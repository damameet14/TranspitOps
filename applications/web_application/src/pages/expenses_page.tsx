import { useEffect, useState } from 'react';
import apiClient from '../shared/api_client';

interface Expense {
  id: number; vehicle_id: number; type: string; amount: number; expense_date: string;
  notes: string | null; vehicle_registration_number: string | null; vehicle_name_model: string | null;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/expenses').then(r => setExpenses(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content"><p className="text-muted">Loading...</p></div>;

  return (
    <>
      <div className="topbar"><h2 className="topbar-title">Expenses</h2></div>
      <div className="page-content">
        <div className="card">
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Vehicle</th><th>Type</th><th>Amount (₹)</th><th>Notes</th></tr></thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{exp.expense_date}</td>
                    <td>{exp.vehicle_registration_number || `#${exp.vehicle_id}`}</td>
                    <td>{exp.type}</td>
                    <td>₹{exp.amount.toLocaleString()}</td>
                    <td style={{maxWidth:250,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{exp.notes || '—'}</td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={5} className="data-table-empty">No expenses found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
