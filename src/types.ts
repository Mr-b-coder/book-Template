
export interface PaperStockOption {
  name: string;
  ppi: number;
}

export enum BindingType {
  PERFECT_BIND = "Perfect Bind / Softcover",
  CASE_BIND = "Case Bind / Hardcover",
  COIL_WIRE_O_SOFTCOVER = "Coil / Wire-O - Softcover",
  COIL_WIRE_O_HARDCOVER = "Coil / Wire-O - Hardcover",
}

export interface BookCoverFormData {
  bookTitle?: string; // Added optional book title
  pageCount: string;
  paperStockPPI: string;
  trimWidth: string;
  trimHeight: string;
  bindingType: BindingType | ''; // Allow empty string for initial/unselected state
}

export interface CoverCalculations {
  // Common
  bookTitle?: string; // Added optional book title
  pageCountNum?: number; 
  ppiNum?: number;       
  trimWidthNum: number; 
  trimHeightNum: number; 
  bindingType: BindingType; // This remains strictly BindingType as it's set after validation
  
  spineWidth?: number;     

  // Overall dimensions
  totalCoverWidth: number;
  totalCoverHeight: number;

  // Bleed or Wrap
  bleedAmount?: number; 
  wrapAmount?: number;  


  // Safety margins
  safetyMargin?: number;            
  safetyMarginTopBottom?: number;   
  safetyMarginBindingEdge?: number; 
  safetyMarginOutsideEdge?: number; 

  // Specific to Case bind
  hingeWidth?: number;      
  boardWidth?: number;      // Represents the total width of the board assembly (front + hinges + spine + back)
  boardHeight?: number;     // Represents the actual physical height of the board material
  frontPanelBoardWidth?: number; // Width of a single front or back board panel

  // Specific to Hardcover Coil/Wire-O
  boardExtension?: number; 
}

export enum DownloadFormat {
  PDF_TEMPLATE = "PDF Template",
  PHOTOSHOP_SCRIPT = "Photoshop Script",
  INDESIGN_SCRIPT = "InDesign Script",
}

// Barcode Generation Types
export enum BarcodeType {
  ISBN = "ISBN EAN-13 + 5",
  DATA_MATRIX = "Data Matrix ECC 200",
}

export interface ISBNBarcodeUserInputs {
  isbn: string; 
  priceCode: string; 
  size: string; 
}

export interface DataMatrixBarcodeUserInputs {
  data: string;
  size: string;
  // encodingType is fixed to ECC200, so not an input
}

export interface GeneratedBarcodeInfo {
  type: BarcodeType;
  inputs: ISBNBarcodeUserInputs | DataMatrixBarcodeUserInputs;
  placeholderText: string; 
  dimensionsString: string; // e.g., "1.75\" x 1.0\""
  widthIn: number;
  heightIn: number;
}

export const BARCODE_SIZES_ISBN = [
  { value: "1.75x1.0", label: "1.75\" W x 1.0\" H (Standard)" },
  { value: "1.5x0.8", label: "1.5\" W x 0.8\" H" },
  { value: "2.0x1.2", label: "2.0\" W x 1.2\" H" },
];

export const BARCODE_SIZES_DATAMATRIX = [
  { value: "0.75x0.75", label: "0.75\" W x 0.75\" H (Standard)" },
  { value: "0.5x0.5", label: "0.5\" W x 0.5\" H" },
  { value: "1.0x1.0", label: "1.0\" W x 1.0\" H" },
];

/* // Commented out as Branding Hub is hidden
export interface GeneratedBrandingCopy {
  tagline: string;
  description: string;
  keywords: string[];
}
*/