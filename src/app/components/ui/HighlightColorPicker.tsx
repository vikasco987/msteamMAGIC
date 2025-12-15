// components/ui/HighlightColorPicker.tsx
"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Paintbrush } from "lucide-react";
import React from "react";

type Props = {
  taskId: string;
  value: string | undefined;
  onChange: (color: string) => void;
};

const presetColors = [
  "#ffffff", // White (no highlight)
  "#f87171", // Red
  "#facc15", // Yellow
  "#4ade80", // Green
  "#60a5fa", // Blue
  "#a78bfa", // Purple
  "#f472b6", // Pink
];

export default function HighlightColorPicker({ taskId, value, onChange }: Props) {
  const handleColorChange = async (color: string) => {
    onChange(color);

    try {
      await fetch("/api/tasks/highlight", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, highlightColor: color }),
      });
    } catch (err) {
      console.error("❌ Failed to persist highlight color:", err);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="w-6 h-6 rounded-full border"
          style={{ backgroundColor: value || "#ffffff" }}
          title="Click to change highlight color"
        ></button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-white border rounded-md p-2 shadow-md space-y-2"
          side="bottom"
          align="start"
        >
          <div className="grid grid-cols-4 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Custom:</span>
            <input
              type="color"
              value={value || "#ffffff"}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-6 h-6 border rounded cursor-pointer"
            />
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
