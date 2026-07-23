import React from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export default function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className="toast">
          {toast.type === 'error' ? (
            <AlertTriangle size={18} color="#f87171" />
          ) : (
            <CheckCircle2 size={18} color="var(--status-low)" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
