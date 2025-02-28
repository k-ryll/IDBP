// src/types.ts

export interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
  export interface LayoutSet {
    id: string;
    name: string;
    layoutType: 'setA' | 'setB' | 'setC' | 'setD' | 'setE' | 'WS' | '2R' | '3R' ; 
    description: string;
  }
  
  export interface PageSet {
    setId: string;
    imageUrl: string;
    cropArea: CropArea | null;
  }
  