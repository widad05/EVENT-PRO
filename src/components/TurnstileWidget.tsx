import React, { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; theme?: 'light' | 'dark' }
      ) => string;
      remove: (id: string) => void;
    };
  }
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ onVerify }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let widgetId: string | undefined;

    const mount = () => {
      if (window.turnstile && containerRef.current) {
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: onVerify,
        });
      }
    };

    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = mount;
      document.head.appendChild(script);
    } else {
      mount();
    }

    return () => {
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [siteKey, onVerify]);

  if (!siteKey) return null;

  return (
    <div className="my-2">
      <div ref={containerRef} />
    </div>
  );
};
