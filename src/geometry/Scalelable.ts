import type { RectCornerKey } from "./Rect";


export type ScaleOperationAnchorReference = {
  mode: 'relativeToOrigin';
} | {
  mode: 'relativeToCenter';
} | {
  mode: 'relativeToRectCorner';
  cornerKey: RectCornerKey;
};

export type UniformScaleConfig = {
  percentAmount: number;
  anchorReference: ScaleOperationAnchorReference;
};

export interface Scalable {

  applyUniformScaleByFactor(args: UniformScaleConfig): void;

  scaledUniformallyByFactor(args: UniformScaleConfig): this;

};
