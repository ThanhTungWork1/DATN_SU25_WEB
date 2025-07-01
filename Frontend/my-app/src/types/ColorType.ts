import type { ColorType } from "./DetailType";

export type ColorProps = {
  colors: ColorType[];
  selectedColor: ColorType | null;
  onSelectColor: (color: ColorType) => void;
}; 