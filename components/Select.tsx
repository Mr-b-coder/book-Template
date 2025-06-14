import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string | number; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, options, ...rest }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#4A5E78] dark:text-[#94A3B8] mb-1"> {/* textSecondary */}
        {label}
      </label>
      <select
        id={id}
        className="w-full px-3 py-2 border border-[#DDE3ED] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#1E293B] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1545A2] dark:focus:ring-[#13B5CF] focus:border-[#1545A2] dark:focus:border-[#13B5CF] transition duration-150 ease-in-out text-[#0A2F5C] dark:text-[#F1F5F9] disabled:bg-[#E7ECF2] dark:disabled:bg-[#334155] disabled:text-[#8DA0B9] dark:disabled:text-[#64748B] disabled:border-[#DDE3ED] dark:disabled:border-[#334155] disabled:cursor-not-allowed"
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;