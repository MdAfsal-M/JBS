import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Label } from "./label";

interface DateOfBirthProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const DateOfBirth: React.FC<DateOfBirthProps> = ({
  value,
  onChange,
  label = "Date of Birth",
  required = false,
  disabled = false,
  error
}) => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 100; // Allow selection of people up to 100 years old
  
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

  const handleDayChange = (day: string) => {
    if (value) {
      const newDate = new Date(value);
      newDate.setDate(parseInt(day));
      onChange(newDate);
    } else {
      const newDate = new Date();
      newDate.setDate(parseInt(day));
      newDate.setMonth(0);
      newDate.setFullYear(currentYear - 18);
      onChange(newDate);
    }
  };

  const handleMonthChange = (month: string) => {
    if (value) {
      const newDate = new Date(value);
      newDate.setMonth(parseInt(month) - 1);
      onChange(newDate);
    } else {
      const newDate = new Date();
      newDate.setDate(1);
      newDate.setMonth(parseInt(month) - 1);
      newDate.setFullYear(currentYear - 18);
      onChange(newDate);
    }
  };

  const handleYearChange = (year: string) => {
    if (value) {
      const newDate = new Date(value);
      newDate.setFullYear(parseInt(year));
      onChange(newDate);
    } else {
      const newDate = new Date();
      newDate.setDate(1);
      newDate.setMonth(0);
      newDate.setFullYear(parseInt(year));
      onChange(newDate);
    }
  };

  const getCurrentDay = () => value ? value.getDate() : undefined;
  const getCurrentMonth = () => value ? value.getMonth() + 1 : undefined;
  const getCurrentYear = () => value ? value.getFullYear() : undefined;

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="grid grid-cols-3 gap-2">
        {/* Day Selector */}
        <Select
          value={getCurrentDay()?.toString() || ""}
          onValueChange={handleDayChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((day) => (
              <SelectItem key={day} value={day.toString()}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month Selector */}
        <Select
          value={getCurrentMonth()?.toString() || ""}
          onValueChange={handleMonthChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Selector */}
        <Select
          value={getCurrentYear()?.toString() || ""}
          onValueChange={handleYearChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {value && (
        <p className="text-xs text-muted-foreground">
          Selected: {value.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      )}
    </div>
  );
};
