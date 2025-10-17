export interface Photo {
  id: number;
  src: string;
  rotation: number;
}

export interface PieceCountItem {
  type: string;
  quantity: number;
}

export interface ContainerData {
  id: string;
  containerNumber: string;
  operationType: string;
  doorNumber: string;
  pieceCount: PieceCountItem[];
  materials: Record<string, number>;
  discrepancies: string;
  photos: Photo[];
  timestamp: string;
  status: string;
}

export const BOX_BLUE = '#0061D5';
export const BOX_DARK_BLUE = '#003D80';
export const BOX_LIGHT_BLUE = '#E8F2FF';
export const BOX_SUCCESS = '#26C281';
export const BOX_GRAY = '#767676';
export const BOX_BORDER = '#E8E8E8';

export const PACKAGE_TYPES = ['Crates', 'Pallets', 'Coils', 'Reels', 'Bundles', 'Cartons', 'Car', 'Bike', 'Boat', 'Other'];
export const OPERATION_TYPES = ['Import', 'Export', 'Delivery'];
export const MATERIALS = ['Pallets', 'Shrink Wrap', 'Air Bags', 'Dunnage'];