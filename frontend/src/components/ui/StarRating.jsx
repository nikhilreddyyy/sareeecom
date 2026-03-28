import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value = 0, onChange, readonly = false, size = 20 }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-transform ${!readonly ? 'hover:scale-110' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={star <= display ? 'text-gold-500 fill-gold-500' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}
