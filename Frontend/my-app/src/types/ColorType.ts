import type { ColorType } from "./DetailType";

export type ColorProps = {
  colors: ColorType[];
  selectedColor: ColorType | null;
  onSelectColor: (color: ColorType) => void;
};

export type ColorType = {
  id: number;
  name: string;
  code: string;
  image?: string;
}; 