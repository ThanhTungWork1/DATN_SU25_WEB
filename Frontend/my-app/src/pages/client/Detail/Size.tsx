
import type { SizeProps } from '../../../types/DetailType';

const Size = ({ variants, selectedSize, onSelectSize }: SizeProps) => {
    const sizes = [...new Set(variants.map(v => v.size))];

    return (
        <div className="mb-3">
            <label className="fw-bold">Size:</label>
            <div className="btn-group flex-wrap" role="group">
                {sizes.map((size) => {
                    const isDisabled = !variants.find(v => v.size === size && v.stock > 0);
                    const isSelected = selectedSize === size;

                    return (
                        <button
                            key={size}
                            className={`btn btn-sm ${isSelected ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => onSelectSize(size)}
                            disabled={isDisabled}
                        >
                            {size}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Size;
