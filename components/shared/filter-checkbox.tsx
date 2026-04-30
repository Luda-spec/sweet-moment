import React from 'react';
import { Checkbox } from '../ui/checkbox';

export interface FilterChecboxProps {
  text: string;
  value: string;
  endAdornment?: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
  name?: string;
}

export const FilterCheckbox: React.FC<FilterChecboxProps> = ({
  text,
  value,
  endAdornment,
  onCheckedChange,
  checked,
  name,
}) => {
  const handleChange = (checkedValue: boolean | string) => {
    if (onCheckedChange) {
      onCheckedChange(checkedValue === true);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`checkbox-${String(name)}-${String(value)}`}
        value={value}
        checked={checked}
        onCheckedChange={handleChange}
        className="rounded-2 w-6 h-6"
      />

      <label
        htmlFor={`checkbox-${String(name)}-${String(value)}`}
        className="leading-none cursor-pointer flex-1"
      >
        {text}
      </label>

      {endAdornment}
    </div>
  );
};