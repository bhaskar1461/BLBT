'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { storage } from '@/services/storage';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [category, setCategory] = useState<'bug' | 'feature' | 'praise' | 'general'>('feature');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const user = storage.getUserProfile();
  const [email, setEmail] = useState(user.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please enter your feedback message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          category,
          message: message.trim(),
          email: email.trim() || undefined,
          rating,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setSubmitted(false);
          setMessage('');
          onClose();
        }, 1800);
      } else {
        setErrorMsg(data.error || 'Failed to submit feedback.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Network error sending feedback.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '460px', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={17} color="var(--primary)" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              Send Feedback to Platform Team
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '18px 20px' }}>
          {submitted ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <CheckCircle2 size={42} className="text-bull mb-3 animate-bounce" />
              <h3 className="font-bold text-base text-white">Thank You!</h3>
              <p className="text-xs text-muted mt-1 max-w-xs">
                Your feedback has been delivered to the administrative console. We read every submission to improve the platform!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Category Pills */}
              <div>
                <span className="text-[11px] font-semibold text-faint uppercase block mb-1.5">
                  Feedback Category
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'feature', label: 'Feature' },
                      { id: 'bug', label: 'Bug' },
                      { id: 'praise', label: 'Praise' },
                      { id: 'general', label: 'General' },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`py-1.5 rounded text-xs font-semibold transition-all ${
                        category === c.id
                          ? 'bg-elevated text-primary border border-cardborder shadow-sm'
                          : 'bg-card text-muted hover:text-white border border-subtle'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <span className="text-[11px] font-semibold text-faint uppercase block mb-1">
                  Experience Rating
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-faint hover:text-gold transition-colors"
                    >
                      <Star
                        size={18}
                        className={star <= rating ? 'fill-[#ffd700] text-[#ffd700]' : 'text-faint'}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-faint font-mono ml-2">
                    {rating === 5 ? 'Exceptional 🔥' : rating === 4 ? 'Great 👍' : `${rating}/5 Stars`}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <span className="text-[11px] font-semibold text-faint uppercase block mb-1">
                  Message / Suggestion
                </span>
                <textarea
                  className="form-input text-xs w-full min-h-[95px] resize-none"
                  placeholder="What would you like to see improved? Found any issues or have a cool feature idea?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {/* Contact Email (Optional) */}
              <div>
                <span className="text-[11px] font-semibold text-faint uppercase block mb-1">
                  Your Email (Optional, for follow-up)
                </span>
                <input
                  type="email"
                  className="form-input text-xs w-full"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div className="p-2 bg-bear/15 border border-bear/30 rounded text-xs text-bear flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="btn btn-primary py-2 text-xs font-bold w-full flex items-center justify-center gap-1.5 shadow-md shadow-bull/20 mt-1"
              >
                <Send size={13} />
                <span>{isSubmitting ? 'Submitting...' : 'Send Feedback'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
