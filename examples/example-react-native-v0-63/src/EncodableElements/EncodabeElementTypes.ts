import { ImageProps, ViewStyle } from "react-native";

export type LayoutInsetConfig = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

export type CornerRadiusConfig = {
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
};

export type TransformConfig = {
  rotateDeg?: number;
  translateX?: number;
  translateY?: number;
  scaleX?: number;
  scaleY?: number;
};

export type LayoutAlignmentHorizontal = {
  mode: 'left' | 'center' | 'right';
  height: number;
} | {
  mode: 'stretch';
};

export type BaseStyleConfig = Pick<ViewStyle, 
  | 'borderColor'
  | 'backgroundColor'
  | 'borderWidth'
>;

export type EncodableElementStyleConfig = BaseStyleConfig & {
  cornerRadius?: CornerRadiusConfig;
  // borderConfig
};

export type LayoutAlignmentVertical = {
  mode: 'top' | 'center' | 'bottom';
  width: number;
} | {
  mode: 'stretch';
};

export type ImageSupportedProps = Pick<ImageProps, 
  | 'blurRadius'
  | 'resizeMode'
>;

export type EncodableElementLayoutConfig = {
  zIndexOverride?: number;
  horizontalAligment: LayoutAlignmentHorizontal;
  verticalAligment: LayoutAlignmentVertical;
  containerMargins?: LayoutInsetConfig;
  transform?: TransformConfig;
};

export type EncodableElementItemBase = {
  elementID: string;
  positionConfig: EncodableElementLayoutConfig;
  styleConfig: EncodableElementStyleConfig;
};

export type EncodableElementItem = EncodableElementItemBase & { 
  elementType: 'image';
  imageURI: string;
  imageProps?: ImageSupportedProps;

} | {
  elementType: 'video';
  videoURI: string;
  shouldLoopVideo: boolean;

} | {
  elementType: 'colorSolid';

} | {
  elementType: 'colorGradient';

} | {
  elementType: 'container';
  elements: Array<EncodableElementItem>;

} | {
  elementType: 'label';
};

