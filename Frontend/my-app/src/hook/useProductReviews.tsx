
import { useEffect, useState } from 'react';

export type Review = {
    id: number;
    productId: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
};

export const useProductReviews = (productId: number) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:3000/reviews?productId=${productId}`)
            .then((res) => res.json())
            .then((data) => {
                setReviews(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [productId]);

    return { reviews, isLoading };
};
