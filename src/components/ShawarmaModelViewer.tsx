import React from 'react';

export function ShawarmaModelViewer() {
  const buster = React.useMemo(() => Date.now(), []);
  
  return (
    <div style={{ width: '100%', height: '500px', background: '#f5f5f4' }} className="rounded-3xl overflow-hidden border border-stone-200">
      {/* Google <model-viewer> pulling directly from raw GitHub data stream */}
      <model-viewer
        src={`https://cdn.jsdelivr.net/gh/lou-sys499/dailybread_shawarma_webar@v1.0.0.0/models/3d_shawarma_sample-v1.glb?t=${buster}`}
        alt="DailyBread Premium Grilled Beef Shawarma Wrap"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1.2"
        shadow-softness="1"
        style={{ width: '100%', height: '100%' }}
      >
        <button slot="ar-button" style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          backgroundColor: '#e11d48',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          View in 3D AR
        </button>
      </model-viewer>
    </div>
  );
}
