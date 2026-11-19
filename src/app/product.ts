export interface Product {
  code: string;
  quantity: number;
  floor: number;
  section: number;
}

// Ako se broj spratova ili sekcija promeni, menja se samo ovde.
export const FLOORS = [1, 2, 3];
export const SECTIONS = [1, 2, 3];

// 2-4 velika slova, razmak, 4-6 cifara
export const CODE_PATTERN = /^[A-Z]{2,4} \d{4,6}$/;
