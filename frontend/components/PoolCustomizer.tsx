export type PoolShape = "rectangle" | "oval" | "kidney" | "lshape";

export const POOL_COLORS = [
  { label: "Classic Blue",  value: "classic",   preview: "#1E90FF" },
  { label: "Deep Blue",     value: "deep",      preview: "#00308F" },
  { label: "Turquoise",     value: "turquoise", preview: "#00CED1" },
  { label: "Dark",          value: "dark",      preview: "#1a3a4a" },
];

export const POOL_SHAPES: { label: string; value: PoolShape }[] = [
  { label: "Rectangle", value: "rectangle" },
  { label: "Oval",      value: "oval"      },
  { label: "Kidney",    value: "kidney"    },
  { label: "L-Shape",   value: "lshape"   },
];

interface PoolCustomizerProps {
  shape: PoolShape;
  color: string;
  onShapeChange: (s: PoolShape) => void;
  onColorChange: (c: string) => void;
}

export default function PoolCustomizer({
  shape, color, onShapeChange, onColorChange,
}: PoolCustomizerProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-xl bg-gray-50 rounded-xl p-4 border border-gray-200">

      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">Shape</p>
        <div className="flex gap-2 flex-wrap">
          {POOL_SHAPES.map((s) => (
            <button
              key={s.value}
              onClick={() => onShapeChange(s.value)}
              className={`px-4 py-1.5 rounded-lg border-2 text-sm transition ${
                shape === s.value
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-300 text-gray-600 hover:border-blue-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">Water color</p>
        <div className="flex gap-3">
          {POOL_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => onColorChange(c.value)}
              title={c.label}
              className={`w-8 h-8 rounded-full border-4 transition ${
                color === c.value ? "border-gray-800 scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c.preview }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}