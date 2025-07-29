// src/types/ColorType.ts

export type ColorType = {
  id: number;
  name: string;
  code?: string; // optional để tương thích
  hex_code?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
};

export type ColorProps = {
  colors: ColorType[];
  selectedColor?: ColorType;
  onSelectColor: (color: ColorType) => void;
};
