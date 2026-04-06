import { useState } from "react";
import Button from "./Button";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const options = ["Today", "3 Days", "7 Days"];

type DropdownProps = {
  onSelect: (period: string) => void;
};

export default function Dropdown({ onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [selected, setSelected] = useState<string>(() => {
    const saved = localStorage.getItem("dropdown-selected");
    return saved || "Today";
  });

  const handleSelect = (value: string) => {
    setSelected(value);
    localStorage.setItem("dropdown-selected", value);
    onSelect(value)
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-xl !bg-[#833AB4] hover:!bg-[#833AB4] gap-2 flex items-center"
      >
        {selected}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <div className="absolute text-sm right-0 mt-2 w-40 rounded-md shadow-lg bg-white">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                selected === option ? "font-semibold bg-gray-100" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}