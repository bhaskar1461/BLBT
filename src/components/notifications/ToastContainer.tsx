import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { alertsEngine } from '../../services/alertsEngine';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert';
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    alertsEngine.registerToastHandler((title, message, type) => {
      const id = `t_${Date.now()}_${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    });
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item">
          <div style={{ marginTop: '2px' }}>
            {toast.type === 'alert' && <Bell size={18} color="var(--gold)" />}
            {toast.type === 'success' && <CheckCircle size={18} color="var(--bull)" />}
            {toast.type === 'info' && <AlertTriangle size={18} color="var(--primary)" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff', marginBottom: '2px' }}>
              {toast.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              {toast.message}
            </div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-faint)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
