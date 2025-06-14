import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  unit?: string;
}

const Input: React.FC<InputProps> = ({ label, id, unit, ...rest }) => {
  return (
    <div>
      {/* V V V THIS IS THE LINE WE ARE CHANGING V V V */}
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        {label}
      </label>
      {/* ^ ^ ^ THIS IS THE LINE WE ARE CHANGING ^ ^ ^ */}
      <div className="relative">
        <input
          id={id}
          name={id}
          className="w-full px-3 py-2 border border-[#DDE3ED] dark:border-[#334155] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1545A2] dark:focus:ring-[#13B5CF] focus:border-[#1545A2] dark:focus:border-[#13B5CF] transition duration-150 ease-in-out bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0A2F5C] dark:text-[#F1F5F9] placeholder-[#8DA0B9] dark:placeholder-[#64748B] disabled:bg-[#E7ECF2] dark:disabled:bg-[#334155] disabled:text-[#8DA0B9] dark:disabled:text-[#64748B] disabled:border-[#DDE3ED] dark:disabled:border-[#334155] disabled:cursor-not-allowed"
          {...rest}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[#4A5E78] dark:text-[#94A3B8] sm:text-sm">{unit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;