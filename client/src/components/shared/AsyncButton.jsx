import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';

export default function AsyncButton({ 
  onClick, 
  children, 
  className = '', 
  type = 'button',
  disabled = false,
  ...props 
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    if (!onClick) return;
    
    // If it's a form submit, we don't handle it here unless we prevent default, 
    // but usually AsyncButton is used with onClick handlers.
    setLoading(true);
    try {
      await onClick(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      type={type}
      className={className} 
      onClick={handleClick} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <FiLoader className="w-5 h-5 animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
