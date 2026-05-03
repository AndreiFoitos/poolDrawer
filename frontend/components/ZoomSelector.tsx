interface ZoomSelectorProps {
  value: number;
  onChange: (zoom: number) => void;
}

const ZOOM_LABELS: Record<number, string> = {
  17: "Neighborhood",
  18: "Street",
  19: "Rooftop",
  20: "Close-up",
};

export default function ZoomSelector({ value, onChange }: ZoomSelectorProps) {
  return (
    <div className="flex flex-col gap-1 w-full max-w-xl">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Zoom</span>
        <span className="font-medium text-gray-700">{ZOOM_LABELS[value]}</span>
      </div>
      <input
        type="range"
        min={17}
        max={20}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>17</span>
        <span>20</span>
      </div>
    </div>
  );
}