
import type { ColorProps } from "../types/ColorType";

const Color = ({ colors, selectedColor, onSelectColor }: ColorProps) => {

  return (
    <div className="mb-3">
      <label className="fw-bold">Màu:</label>
      <div className="d-flex gap-2 flex-wrap mt-2">
        {colors.map((color) => {
          const isSelected = selectedColor?.id === color.id;
          const code = color.code ? color.code.toLowerCase() : "";
          const isWhite = code === "#fff" || code === "#ffffff";
          const isRed = code === "#ff0000" || code === "red";
          const classes = [
            "color-circle",
            isSelected && !isWhite && !isRed && "color-circle--selected",
            isWhite && "color-circle--white",
            isRed && isSelected && "color-circle--red"
          ].filter(Boolean).join(" ");
          return (
            <span
              key={color.id}
              title={color.name}
              onClick={() => onSelectColor(color)}
              className={classes}
              style={isWhite ? undefined : { backgroundColor: color.code }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Color;
