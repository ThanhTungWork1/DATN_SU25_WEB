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
            <div className="d-flex gap-2 flex-wrap mt-2">
                {colors.map((color) => {
                    const isSelected = selectedColor?.id === color.id;

                    return (
                        <span
                            key={color.id}
                            title={color.name}
                            onClick={() => onSelectColor(color)}
                            style={{
                                backgroundColor: color.code,
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                border: isSelected ? '2px solid red' : '1px solid #ccc',
                                display: 'inline-block',
                                cursor: 'pointer',
                                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                                transition: 'transform 0.2s ease, border 0.2s ease',
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Color;
