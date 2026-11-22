import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildWhatsAppUrl } from '../lib/api';

interface WhatsAppButtonProps {
  label?: string;
  message: string;
  variant?: 'primary' | 'outline' | 'subtle';
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  label = 'Contactez-nous sur WhatsApp',
  message,
  variant = 'outline',
  className = '',
}) => {
  const { settings } = useApp();
  const href = buildWhatsAppUrl(settings.whatsapp_number, message);

  const base =
    'inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2';

  const styles =
    variant === 'primary'
      ? 'bg-[#181715] text-[#FAF8F5] hover:bg-[#2F2C27]'
      : variant === 'subtle'
        ? 'border border-[#D9D2C5] bg-[#FAF8F5] text-[#181715] hover:border-[#9A7B3E] hover:text-[#7D622F]'
        : 'border border-[#181715] text-[#181715] hover:bg-[#181715] hover:text-[#FAF8F5]';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
    >
      <MessageCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      <span>{label}</span>
    </a>
  );
};
