'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Server,
  Zap,
  Key,
  Lock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { openAlgoGateway, type BrokerConfig, type BrokerId } from '@/lib/broker/openalgo';

interface BrokerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrokerManagerModal: React.FC<BrokerManagerModalProps> = ({ isOpen, onClose }) => {
  const [brokers, setBrokers] = useState<BrokerConfig[]>(() => openAlgoGateway.getBrokers());
  const [activeBrokerId, setActiveBrokerId] = useState<BrokerId>(() => openAlgoGateway.getActiveBroker().id);
  const [editingBroker, setEditingBroker] = useState<BrokerConfig | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiSecretInput, setApiSecretInput] = useState('');
  const [clientIdInput, setClientIdInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectActive = (id: BrokerId) => {
    openAlgoGateway.setActiveBroker(id);
    setActiveBrokerId(id);
    setStatusMessage(`Active execution gateway switched to ${id.toUpperCase()}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleStartEdit = (b: BrokerConfig) => {
    setEditingBroker(b);
    setApiKeyInput(b.apiKey || '');
    setApiSecretInput(b.apiSecret || '');
    setClientIdInput(b.clientId || '');
  };

  const handleSaveConfig = () => {
    if (!editingBroker) return;
    const isConfigured = Boolean(apiKeyInput.trim() || editingBroker.id === 'paper');
    const updated = {
      apiKey: apiKeyInput.trim(),
      apiSecret: apiSecretInput.trim(),
      clientId: clientIdInput.trim(),
      isConfigured,
      isConnected: isConfigured,
    };
    openAlgoGateway.updateBrokerConfig(editingBroker.id, updated);
    setBrokers(openAlgoGateway.getBrokers());
    setEditingBroker(null);
    setStatusMessage(`Credentials saved for ${editingBroker.name}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2e39] bg-[#171b26]">
          <div className="flex items-center gap-2.5">
            <Server size={18} className="text-[#2962ff]" />
            <div>
              <h2 className="font-bold text-sm text-white">OpenAlgo Broker Gateway</h2>
              <p className="text-[11px] text-[#787b86]">
                Normalized execution layer for Zerodha, Upstox, Dhan, and Paper Sandbox
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:text-white text-[#787b86]">
            <X size={16} />
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div className="px-4 py-2 bg-[#089981]/15 border-b border-[#089981]/40 text-[#089981] text-xs font-mono flex items-center gap-2">
            <CheckCircle2 size={13} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh] space-y-4">
          {editingBroker ? (
            /* Configure Broker Form */
            <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#2a2e39] pb-2">
                <span className="font-bold text-sm text-white">Configure {editingBroker.name}</span>
                <button
                  onClick={() => setEditingBroker(null)}
                  className="text-xs text-[#787b86] hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[#787b86] mb-1">API Key / App Key:</label>
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="e.g. your_kite_api_key"
                    className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2.5 py-1.5 text-white outline-none focus:border-[#2962ff]"
                  />
                </div>
                <div>
                  <label className="block text-[#787b86] mb-1">API Secret:</label>
                  <input
                    type="password"
                    value={apiSecretInput}
                    onChange={(e) => setApiSecretInput(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2.5 py-1.5 text-white outline-none focus:border-[#2962ff]"
                  />
                </div>
                <div>
                  <label className="block text-[#787b86] mb-1">Client ID / User ID:</label>
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="e.g. AB1234"
                    className="w-full bg-[#1e222d] border border-[#2a2e39] rounded px-2.5 py-1.5 text-white outline-none focus:border-[#2962ff]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingBroker(null)}
                  className="px-3 py-1.5 rounded bg-[#2a2e39] text-xs text-[#d1d4dc] hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-1.5 rounded bg-[#2962ff] hover:bg-[#1e53e5] text-xs font-bold text-white shadow-sm"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          ) : (
            /* Broker List */
            <div className="space-y-2.5">
              {brokers.map((broker) => {
                const isActive = broker.id === activeBrokerId;

                return (
                  <div
                    key={broker.id}
                    className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-[#171b26] border-[#2962ff] ring-1 ring-[#2962ff]/40'
                        : 'bg-[#171b26]/60 border-[#2a2e39] hover:border-[#434651]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{broker.name}</span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#089981]/20 text-[#089981] border border-[#089981]/40 uppercase">
                            ACTIVE
                          </span>
                        )}
                        {broker.isConnected && (
                          <span className="flex items-center gap-1 text-[11px] text-[#089981] font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#787b86]">{broker.tagline}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {broker.id !== 'paper' && (
                        <button
                          onClick={() => handleStartEdit(broker)}
                          className="px-2.5 py-1 rounded bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-xs text-[#d1d4dc] transition-colors"
                        >
                          {broker.isConfigured ? 'Edit Keys' : 'Connect'}
                        </button>
                      )}

                      {!isActive && (
                        <button
                          onClick={() => handleSelectActive(broker.id)}
                          className="px-3 py-1 rounded bg-[#2962ff] hover:bg-[#1e53e5] text-xs font-bold text-white transition-colors cursor-pointer"
                        >
                          Make Active
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Institutional Invariant Notice */}
          <div className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-3 text-xs text-[#787b86] leading-relaxed">
            <div className="flex items-center gap-1.5 text-white font-bold mb-1">
              <ShieldCheck size={14} className="text-[#089981]" />
              <span>Safety & Sandboxing Guarantee</span>
            </div>
            <p>
              By default, all orders route through the deterministic <strong>Celsius Paper Sandbox</strong> using integer arithmetic ($10^8$ base units). When connected to Zerodha or Upstox, orders only execute after explicit 1-click confirmation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2a2e39] bg-[#171b26] flex items-center justify-between text-xs font-mono text-[#787b86]">
          <span>OpenAlgo v2.4 Normalized Specification</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#2a2e39] hover:bg-[#434651] text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
