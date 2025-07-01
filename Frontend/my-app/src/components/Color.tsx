import type { ColorType } from "../types/DetailType";
import type { ColorProps } from "../types/ColorType";

const Color = ({ colors, selectedColor, onSelectColor }: ColorProps) => {
  return (
    <div className="mb-3">
      <label className="fw-bold">Màu:</label>
      <div className="d-flex gap-2 flex-wrap mt-2">
        {colors.map((color) => {
          const isSelected = selectedColor?.id === color.id;

          const borderStyle =
            isSelected
              ? color.code.toLowerCase() === "#ff0000" || color.code.toLowerCase() === "red"
                ? "2.5px solid red"
                : "1.5px solid #00c6ab"
              : "1px solid #ccc";

          return (
            <span
              key={color.id}
              title={color.name}
              onClick={() => onSelectColor(color)}
              style={{
                backgroundColor: color.code,
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: borderStyle,
                display: "inline-block",
                cursor: "pointer",
                transform: isSelected ? "scale(1.15)" : "scale(1)",
                transition: "transform 0.2s ease, border 0.2s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Color;
