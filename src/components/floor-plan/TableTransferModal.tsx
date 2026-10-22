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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1320] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Masa Taşıma & Aktarım</h3>
              <p className="text-xs text-slate-400">
                Açık adisyonu işletmedeki boş bir masaya aktarın
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              setIsTableTransferModalOpen(false);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Table Info */}
        <div className="mb-4 p-3.5 rounded-xl bg-[#0b0f17] border border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">Taşınacak Masa (Kaynak)</div>
            <div className="text-sm font-semibold text-amber-400 mt-0.5">{sourceTable?.name || 'Seçilmedi'}</div>
          </div>
          <div className="text-xs text-slate-300 font-mono tabular-nums">
            {sourceTable?.capacity} Kişilik Kapasite
          </div>
        </div>

        {/* Target Table Selection */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-300 mb-2">
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
                      ? 'bg-amber-500/15 border-amber-500/50 text-slate-100 font-semibold shadow-sm'
                      : 'bg-[#111827] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold">{table.name}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3" />
                    <span>{table.capacity} Kişilik • {table.section}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              Şu anda aktarılacak boş masa bulunmamaktadır.
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
            className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
          >
            Vazgeç
          </button>
          <button
            disabled={!targetTableId}
            onClick={handleConfirmTransfer}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 disabled:hover:bg-amber-500 text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Taşımayı Onayla</span>
          </button>
        </div>
      </div>
    </div>
  );
}
