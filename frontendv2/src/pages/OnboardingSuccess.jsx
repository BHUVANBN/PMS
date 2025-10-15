import React from 'react';

export default function OnboardingSuccess() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fafafa',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: 560,
        width: '100%',
        background: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>Documents submitted successfully</h1>
        <p style={{ margin: 0, color: '#6b7280', marginBottom: 16 }}>Thank you</p>
      </div>
    </div>
  );
}
