import type { ColorType } from '../types/DetailType';

type ColorProps = {
    colors: ColorType[];
    selectedColor: ColorType | null;
    onSelectColor: (color: ColorType) => void;
};

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
};

export default Color;
