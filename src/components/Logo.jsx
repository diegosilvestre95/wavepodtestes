import React from 'react';

const Logo = ({ size = 40, showText = true, light = false }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke={light ? "#fff" : "#FFD700"} strokeWidth="4" />
        <path d="M25 35L35 70L50 45L65 70L75 35" stroke={light ? "#fff" : "#A0A0A0"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M50 35H65C72 35 78 40 78 47.5C78 55 72 60 65 60H50" stroke="#FFD700" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
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
