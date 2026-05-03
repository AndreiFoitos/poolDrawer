type PoolShape = "rectangle" | "oval";

interface ShapeSelectorProps {
  value: PoolShape;
  onChange: (shape: PoolShape) => void;
}

export default function ShapeSelector({ value, onChange }: ShapeSelectorProps) {
  const shapes: PoolShape[] = ["rectangle", "oval"];

  return (
    <div className="flex gap-2">
      {shapes.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-4 py-2 rounded-lg border-2 capitalize transition ${
            value === s
              ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
              : "border-gray-300 text-gray-600 hover:border-blue-400"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}