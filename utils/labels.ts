import type { PeeAmount, PoopConsistency } from "../types/models";

export const consistencyLabels: Record<PoopConsistency, string> = {
  hard: "偏硬",
  normal: "正常",
  soft: "偏软",
  diarrhea: "腹泻",
};
export const amountLabels: Record<PeeAmount, string> = {
  small: "少量",
  medium: "中等",
  large: "大量",
};
