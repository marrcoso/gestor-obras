import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export interface NetworkBeaconProps {
  isOnline: boolean;
}

export const NetworkBeacon: React.FC<NetworkBeaconProps> = ({ isOnline }) => {
  return (
    <div
      className={`flex items-center justify-between p-2.5 px-3.5 rounded-lg border transition-colors ${
        isOnline
          ? 'bg-status-paid-bg border-status-paid/40 text-status-paid'
          : 'bg-status-late-bg border-status-late/40 text-status-late'
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi size={18} className="text-status-paid" />
        ) : (
          <WifiOff size={18} className="text-status-late" />
        )}
        <span className="text-xs font-bold">
          {isOnline ? 'Sinal 4G / Wi-Fi Conectado' : 'Sem Conexão (Modo Offline)'}
        </span>
      </div>

      <span className="text-[11px] font-semibold">
        {isOnline ? 'Sync em tempo real' : 'Salvo no celular'}
      </span>
    </div>
  );
};
