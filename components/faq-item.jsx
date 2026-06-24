'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-right bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-800">{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ms-2" />
          : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ms-2" />}
      </button>
      {open && (
        <div className="p-4 bg-gray-50 text-gray-600 leading-relaxed border-t border-gray-200">
          {a}
        </div>
      )}
    </div>
  );
}
