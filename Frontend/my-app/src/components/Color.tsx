import type { ColorType } from "../types/ColorType";
import "../assets/styles/color.css";

type Props = {
  colors: ColorType[];
  selectedColor: ColorType | null;
  onSelectColor: (c: ColorType) => void;
  isDisabled?: (c: ColorType) => boolean;
};

const Color = ({ colors, selectedColor, onSelectColor, isDisabled }: Props) => {
  return (
    <div className="mb-3">
      <div className="d-flex gap-2 flex-wrap mt-2">
        {colors.map((color) => {
          const isSelected = selectedColor?.id === color.id;
          const code = (color.code || color.hex_code || "").toLowerCase();
          const isWhite = code === "#fff" || code === "#ffffff";
          const isRed = code === "#ff0000" || code === "red";
          const disabled = isDisabled ? isDisabled(color) : false;

          const classes = [
            "color-circle",
            isSelected && !isWhite && !isRed && "color-circle--selected",
            isWhite && "color-circle--white",
            isRed && isSelected && "color-circle--red",
            disabled && "color-circle--disabled",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <span
              key={color.id}
              title={disabled ? `${color.name} (không khả dụng)` : color.name}
              onClick={() => {
                if (!disabled) onSelectColor(color);
              }}
              className={classes}
              style={isWhite ? undefined : { backgroundColor: code }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Color;
