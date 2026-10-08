'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyHashButtonProps {
  hash: string;
  label?: string;
  className?: string;
}

export function CopyHashButton({
  hash,
  label = 'Copy Fingerprint',
  className,
}: CopyHashButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={handleCopy}
      className={
        className ||
        'px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-canvas font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-primary/20 shrink-0 self-end md:self-center cursor-pointer'
      }
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? 'Hash Copied!' : label}</span>
    </button>
  );
}
