'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import { ArrowRightLeft, X, Check, Users } from 'lucide-react';

export default function TableTransferModal() {
  const {
    isTableTransferModalOpen,
    setIsTableTransferModalOpen,
    selectedTableId,
    tables,
    transferTable,
  } = usePOS();

  const [targetTableId, setTargetTableId] = useState<string>('');

  if (!isTableTransferModalOpen) return null;

  const sourceTable = tables.find((t) => t.id === selectedTableId);
  const emptyTables = tables.filter((t) => t.id !== selectedTableId && t.status === 'empty');

  const handleConfirmTransfer = () => {
    if (!selectedTableId || !targetTableId) return;
    sounds.playTap();
    transferTable(selectedTableId, targetTableId);
    setIsTableTransferModalOpen(false);
    setTargetTableId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">Masa Taşıma</h3>
              <p className="text-xs text-stone-400">
                Adisyonu başka bir boş masaya aktarın
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              setIsTableTransferModalOpen(false);
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Table Info */}
        <div className="mb-4 p-3 rounded-2xl bg-[#090b10] border border-stone-800/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-400 uppercase font-medium">Taşınacak Masa (Kaynak)</div>
            <div className="text-sm font-bold text-amber-400">{sourceTable?.name || 'Seçilmedi'}</div>
          </div>
          <div className="text-xs text-stone-300 font-mono">
            {sourceTable?.capacity} Kişilik
          </div>
        </div>

        {/* Target Table Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-stone-300 mb-2">
            Hedef Boş Masayı Seçin:
          </label>
          {emptyTables.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {emptyTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => {
                    sounds.playTap();
                    setTargetTableId(table.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    targetTableId === table.id
                      ? 'bg-amber-500/15 border-amber-500 text-stone-100 font-bold shadow-sm'
                      : 'bg-[#181c2a] border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="text-xs font-bold">{table.name}</div>
                  <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3" />
                    <span>{table.capacity} Kişilik • {table.section}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-center text-xs text-stone-400">
              Şu anda boş masa bulunmamaktadır.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playTap();
              setIsTableTransferModalOpen(false);
            }}
            className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 text-xs font-semibold transition-colors"
          >
            Vazgeç
          </button>
          <button
            disabled={!targetTableId}
            onClick={handleConfirmTransfer}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Taşımayı Onayla</span>
          </button>
        </div>
      </div>
    </div>
  );
}
