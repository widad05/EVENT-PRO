import React, { useState } from 'react';
import { Plus, Printer, Trash2, X } from 'lucide-react';
import { apiFetch, formatDateFr, formatMad } from '../../lib/api';
import type { QuoteItem, QuoteRecord } from '../../types';

const QUOTE_STATUSES = [
  'Nouvelle demande',
  'En cours',
  'Devis envoyé',
  'En attente du client',
  'Accepté',
  'Refusé',
  'Annulé',
];

interface QuoteBuilderModalProps {
  quote: QuoteRecord | null;
  initialItems: QuoteItem[];
  onClose: () => void;
  onSaved: () => void;
}

export const QuoteBuilderModal: React.FC<QuoteBuilderModalProps> = ({
  quote,
  initialItems,
  onClose,
  onSaved,
}) => {
  const isNew = !quote;
  const [clientName, setClientName] = useState(quote?.client_name || '');
  const [clientEmail, setClientEmail] = useState(quote?.client_email || '');
  const [clientPhone, setClientPhone] = useState(quote?.client_phone || '');
  const [eventType, setEventType] = useState(quote?.event_type || 'Mariage');
  const [eventDate, setEventDate] = useState(quote?.event_date || '');
  const [eventLocation, setEventLocation] = useState(quote?.event_location || 'Casablanca');
  const [guestCount, setGuestCount] = useState(quote?.guest_count || 100);
  const [status, setStatus] = useState(quote?.status || 'Devis envoyé');
  const [validUntil, setValidUntil] = useState(quote?.valid_until || '');
  const [discountMad, setDiscountMad] = useState(quote?.discount_mad || 0);
  const [adminNotes, setAdminNotes] = useState(quote?.admin_notes || '');
  const [items, setItems] = useState<QuoteItem[]>(
    initialItems.length > 0
      ? initialItems
      : [{ description: 'Coordination & Direction artistique', quantity: 1, unit_price_mad: 10000, line_total_mad: 10000 }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unit_price_mad, 0);
  const total = Math.max(0, subtotal - discountMad);

  const updateLine = (idx: number, patch: Partial<QuoteItem>) => {
    setItems((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, ...patch };
        next.line_total_mad = next.quantity * next.unit_price_mad;
        return next;
      })
    );
  };

  const addLine = () => {
    setItems((prev) => [
      ...prev,
      { description: '', quantity: 1, unit_price_mad: 0, line_total_mad: 0 },
    ]);
  };

  const removeLine = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      if (isNew) {
        await apiFetch('/api/admin/quotes', {
          method: 'POST',
          body: JSON.stringify({
            client_name: clientName,
            client_email: clientEmail,
            client_phone: clientPhone,
            event_type: eventType,
            event_date: eventDate,
            event_location: eventLocation,
            guest_count: guestCount,
            valid_until: validUntil,
            discount_mad: discountMad,
            admin_notes: adminNotes,
            items,
          }),
        });
      } else if (quote) {
        await apiFetch(`/api/admin/quotes/${quote.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            valid_until: validUntil,
            discount_mad: discountMad,
            admin_notes: adminNotes,
            items,
          }),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-[#E5E0D8] bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4 no-print">
          <div>
            <p className="font-mono text-xs text-[#9A7B3E]">
              {quote ? quote.reference_code : 'NOUVEAU DEVIS'}
            </p>
            <h2 className="font-serif text-2xl font-semibold text-[#181715]">
              {isNew ? 'Créer un devis client' : 'Éditer le devis & les lignes tarifaires'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#D9D2C5] px-3 py-1.5 text-xs font-medium text-[#181715]"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="rounded-md p-1.5 text-[#5C564E] hover:bg-[#F2EFE9]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Print Header for PDF export */}
        <div className="hidden print:block border-b pb-4 mb-4">
          <p className="font-serif text-2xl font-bold">EVENT PRO — Casablanca, Maroc</p>
          <p className="text-xs">Devis {quote?.reference_code || ''} · Devise : MAD</p>
          <p className="mt-2 text-sm">
            Client : {clientName} ({clientEmail} · {clientPhone})
          </p>
          <p className="text-xs">
            Événement : {eventType} · {formatDateFr(eventDate)} · {guestCount} invités
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            {error}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 no-print">
          <div>
            <label className="block text-xs font-medium text-[#181715]">Client *</label>
            <input
              type="text"
              disabled={!isNew}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs disabled:bg-[#F2EFE9]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#181715]">Email *</label>
            <input
              type="email"
              disabled={!isNew}
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs disabled:bg-[#F2EFE9]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#181715]">Téléphone</label>
            <input
              type="tel"
              disabled={!isNew}
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs disabled:bg-[#F2EFE9]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#181715]">Type d’événement</label>
            <input
              type="text"
              disabled={!isNew}
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs disabled:bg-[#F2EFE9]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#181715]">Lieu</label>
            <input
              type="text"
              disabled={!isNew}
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs disabled:bg-[#F2EFE9]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#181715]">Statut du devis</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
            >
              {QUOTE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#181715]">Date événement</label>
            <input
              type="date"
              disabled={!isNew}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs disabled:bg-[#F2EFE9]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#181715]">Invités</label>
            <input
              type="number"
              disabled={!isNew}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs disabled:bg-[#F2EFE9]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#181715]">Valable jusqu’au</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#181715]">
              Postes &amp; Prestations (MAD)
            </h3>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#9A7B3E] hover:text-[#7D622F] no-print"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Ajouter une ligne</span>
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 items-center gap-2 rounded border border-[#E5E0D8] p-2 text-xs"
              >
                <input
                  type="text"
                  placeholder="Désignation de la prestation..."
                  value={item.description}
                  onChange={(e) => updateLine(idx, { description: e.target.value })}
                  className="col-span-6 rounded border border-[#D9D2C5] px-2.5 py-1.5"
                />
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateLine(idx, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                  className="col-span-2 rounded border border-[#D9D2C5] px-2 py-1.5 text-right tabular-nums"
                />
                <input
                  type="number"
                  min={0}
                  value={item.unit_price_mad}
                  onChange={(e) => updateLine(idx, { unit_price_mad: Math.max(0, Number(e.target.value) || 0) })}
                  className="col-span-2 rounded border border-[#D9D2C5] px-2 py-1.5 text-right tabular-nums"
                />
                <div className="col-span-1 text-right font-mono font-medium tabular-nums">
                  {item.quantity * item.unit_price_mad}
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  aria-label="Supprimer ligne"
                  className="col-span-1 flex justify-center text-red-700 hover:text-red-900 no-print"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="mt-6 flex flex-col items-end gap-2 border-t border-[#E5E0D8] pt-4 text-sm">
          <div className="flex w-64 justify-between">
            <span className="text-[#5C564E]">Sous-total</span>
            <span className="font-mono font-medium tabular-nums">{formatMad(subtotal)}</span>
          </div>
          <div className="flex w-64 items-center justify-between gap-2">
            <span className="text-[#5C564E]">Remise (MAD)</span>
            <input
              type="number"
              min={0}
              value={discountMad}
              onChange={(e) => setDiscountMad(Math.max(0, Number(e.target.value) || 0))}
              className="w-28 rounded border border-[#D9D2C5] px-2 py-1 text-right font-mono text-xs tabular-nums"
            />
          </div>
          <div className="flex w-64 justify-between border-t border-[#E5E0D8] pt-2 text-base font-semibold text-[#181715]">
            <span>Total net</span>
            <span className="font-mono text-[#9A7B3E] tabular-nums">{formatMad(total)}</span>
          </div>
        </div>

        <div className="mt-5 no-print">
          <label className="block text-xs font-medium text-[#181715]">Notes internes / conditions</label>
          <textarea
            rows={2}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="mt-1 w-full rounded border border-[#D9D2C5] px-3 py-2 text-xs"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-[#E5E0D8] pt-4 no-print">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#D9D2C5] px-4 py-2 text-xs font-medium text-[#181715]"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-md bg-[#9A7B3E] px-5 py-2 text-xs font-medium text-[#FAF8F5] hover:bg-[#7D622F]"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer le devis'}
          </button>
        </div>
      </div>
    </div>
  );
};
