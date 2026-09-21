import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { RefreshCw } from 'lucide-react';

export const QRCodeCanvas = ({ 
  value, 
  size = 220, 
  className = '', 
  alt = 'QR Code',
  logo = null,
  logoSizeRatio = 0.22,
  errorCorrectionLevel = 'Q'
}) => {
  const [dataUrl, setDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!value) {
      setDataUrl('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // If logo is present, use High or Quartile error correction (25%-30% fault tolerance)
    const ecLevel = logo ? (errorCorrectionLevel || 'Q') : 'M';

    QRCode.toDataURL(value, {
      width: Math.max(size * 3, 600), // Ultra high definition for crisp scanning
      margin: 2, // Standard quiet zone for banking camera lenses
      errorCorrectionLevel: ecLevel,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        setDataUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
        setError('Gagal membuat QR Code');
        setLoading(false);
      });
  }, [value, size, logo, errorCorrectionLevel]);

  if (loading) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`flex items-center justify-center bg-gray-50 border border-palette-subtle rounded-xl ${className}`}
      >
        <RefreshCw className="w-5 h-5 text-palette-primary animate-spin" />
      </div>
    );
  }

  if (error || !dataUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`flex items-center justify-center bg-gray-100 text-gray-500 text-xs text-center p-2 rounded-xl ${className}`}
      >
        <span>{error || 'QR Code Kosong'}</span>
      </div>
    );
  }

  const logoDimension = Math.round(size * logoSizeRatio);

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src={dataUrl} 
        alt={alt} 
        style={{ width: size, height: size }}
        className="w-full h-full object-contain bg-white rounded-xl shadow-xs" 
      />
      
      {logo && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div 
            style={{ 
              width: logoDimension, 
              height: logoDimension,
              padding: Math.max(3, Math.round(logoDimension * 0.08))
            }}
            className="bg-white rounded-full shadow-md border border-gray-200/80 ring-2 ring-white flex items-center justify-center overflow-hidden"
          >
            <img 
              src={logo} 
              alt="Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
