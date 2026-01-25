import type { ColorProps } from "../types/ColorType";
import "../assets/styles/color.css";

const Color = ({ colors, selectedColor, onSelectColor }: ColorProps) => {
  return (
    <div className="color-picker">
      {colors.map((color) => {
        const isSelected = selectedColor?.id === color.id;
        const code = (color.code || color.hex_code || "").toLowerCase();
        const isWhite = code === "#fff" || code === "#ffffff";

        const classes = ["color-circle", isSelected && "selected"]
          .filter(Boolean)
          .join(" ");
        return (
          <span
            key={color.id}
            title={color.name}
            onClick={() => onSelectColor(color)}
            className={classes}
            style={
              isWhite
                ? { backgroundColor: code, border: "1px solid #ddd" }
                : { backgroundColor: code }
            }
          />
        );
      })}
    </div>
  );
};

export default Color;
