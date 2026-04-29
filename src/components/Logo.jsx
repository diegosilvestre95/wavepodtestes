import React from 'react';

const Logo = ({ size = 40, showText = true, light = false }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Círculo com gradiente Prata/Ouro */}
        <circle cx="50" cy="50" r="48" stroke="url(#logo_grad)" strokeWidth="4" />
        
        {/* Letra W (Prata Metálico) */}
        <path d="M25 35L35 70L50 45L65 70L75 35" stroke="url(#silver_grad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Letra P (Dourado Metálico) */}
        <path d="M50 35H65C72 35 78 40 78 47.5C78 55 72 60 65 60H50" stroke="url(#gold_grad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        
        <defs>
          <linearGradient id="logo_grad" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0" stopColor="#E8E8E8" />
            <stop offset="0.5" stopColor="#C0C0C0" />
            <stop offset="1" stopColor="#FFD700" />
          </linearGradient>
          <linearGradient id="silver_grad" x1="25" y1="35" x2="75" y2="70">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#808080" />
          </linearGradient>
          <linearGradient id="gold_grad" x1="50" y1="35" x2="78" y2="60">
            <stop offset="0" stopColor="#FFD700" />
            <stop offset="1" stopColor="#B8860B" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ 
            fontFamily: 'Space Grotesk', 
            fontSize: size * 0.5, 
            fontWeight: 800, 
            letterSpacing: '0.05em', 
            color: light ? '#fff' : '#000',
            textTransform: 'uppercase'
          }}>
            WAVEPOD
          </span>
          <span style={{ 
            fontSize: size * 0.22, 
            fontWeight: 500, 
            color: light ? 'rgba(255,255,255,0.6)' : '#888',
            marginTop: 2
          }}>
            Pods Descartáveis
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
