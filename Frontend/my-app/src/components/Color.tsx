import type { ColorType } from '../types/DetailType';

<<<<<<< HEAD
<<<<<<< HEAD
import type { ColorProps } from "../types/ColorType";

const Color = ({ colors, selectedColor, onSelectColor }: ColorProps) => {
  return (
    <div className="mb-3">
      <label className="fw-bold">Màu:</label>
      <div className="d-flex gap-2 flex-wrap mt-2">
        {colors.map((color) => {
          const isSelected = selectedColor?.id === color.id;
          let borderStyle = "1px solid #ccc";
          if (isSelected) {
            if (
              color.code === "#ff0000" ||
              color.code.toLowerCase() === "red"
            ) {
              borderStyle = "2.5px solid red";
            } else {
              borderStyle = "1.5px solid #00c6ab";
            }
          }

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
=======
=======
type ColorProps = {
    colors: ColorType[];
    selectedColor: ColorType | null;
    onSelectColor: (color: ColorType) => void;
};
>>>>>>> f51a0d77 (trang detail hoan thien)

const Color = ({ colors, selectedColor, onSelectColor }: ColorProps) => {
    return (
        <div className="mb-3">
            <label className="fw-bold">Màu:</label>
            <div className="d-flex gap-2 flex-wrap">
                {colors.map((color) => {
                    const isSelected = selectedColor?.name === color.name;

                    return (
                        <span
                            key={color.name}
                            title={color.name}
                            onClick={() => onSelectColor(color)}
                            style={{
                                backgroundColor: color.code,
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                border: isSelected ? '2px solid #000' : '1px solid #ccc',
                                display: 'inline-block',
                                cursor: 'pointer',
                                boxShadow: isSelected ? '0 0 0 2px #007bff' : 'none',
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
>>>>>>> 6a994c6e (giao dien detail)
};

export default Color;
