import { useState } from 'react';


export default function ToggleButton({ label1 , label2 }) {
  const [enabled, setEnabled] = useState(false);

  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      {/* Hidden checkbox for accessibility */}

      {label1 && (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
          {label1}
        </span>
      )}
      <input
        type="checkbox"
        checked={enabled}
        onChange={() => setEnabled(!enabled)}
        className="sr-only text-sm peer"
      />
      
      <div className="relative w-11 h-5 bg-gray-200  peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
      
  
      {label2 && (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
          {label2}
        </span>
      )}
    </label>
  );
}

