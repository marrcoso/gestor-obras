import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export interface NetworkBeaconProps {
  isOnline: boolean;
}

export const NetworkBeacon: React.FC<NetworkBeaconProps> = ({ isOnline }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        backgroundColor: isOnline ? 'var(--status-paid-bg)' : 'var(--status-late-bg)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isOnline ? (
          <Wifi size={18} color="var(--status-paid)" />
        ) : (
          <WifiOff size={18} color="var(--status-late)" />
        )}
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: isOnline ? 'var(--status-paid)' : 'var(--status-late)'
          }}
        >
          {isOnline ? 'Sinal 4G / Wi-Fi Conectado' : 'Sem Conexão (Modo Offline)'}
        </span>
      </div>

      <span
        style={{
          fontSize: '11px',
          color: isOnline ? 'var(--status-paid)' : 'var(--status-late)',
          fontWeight: 600
        }}
      >
        {isOnline ? 'Sync em tempo real' : 'Salvo no celular'}
      </span>
    </div>
  );
};
