<<<<<<< HEAD
import { useState } from "react";

export function useQuantityControl(max: number) {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(max, prev + 1));
  };

  const handleInputChange = (value: string) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return;
    if (parsed < 1) return setQuantity(1);
    if (parsed > max) return setQuantity(max);
    setQuantity(parsed);
  };

  return {
    quantity,
    handleDecrease,
    handleIncrease,
    handleInputChange,
  };
=======
import { useState } from 'react';

export function useQuantityControl(max: number) {
    const [quantity, setQuantity] = useState(1);

    const handleDecrease = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    const handleIncrease = () => {
        setQuantity((prev) => Math.min(max, prev + 1));
    };

    const handleInputChange = (value: string) => {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) return;
        if (parsed < 1) return setQuantity(1);
        if (parsed > max) return setQuantity(max);
        setQuantity(parsed);
    };

    return {
        quantity,
        handleDecrease,
        handleIncrease,
        handleInputChange,
    };
>>>>>>> f51a0d77 (trang detail hoan thien)
}
