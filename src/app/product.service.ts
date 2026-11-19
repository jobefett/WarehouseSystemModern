import { Injectable, signal } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { Product } from './product';

/**
 * Simulira backend. Metode vraćaju Observable (kao HttpClient),
 * pa se kasnije mogu zameniti pravim HTTP pozivima bez izmena u komponentama.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly _products = signal<Product[]>([
    { code: 'MYTZ 123456', quantity: 100, floor: 1, section: 3 },
    { code: 'UK 13462', quantity: 12, floor: 1, section: 2 },
    { code: 'KOB 8472', quantity: 1, floor: 2, section: 1 },
  ]);

  readonly products = this._products.asReadonly();

  add(product: Product): Observable<Product> {
    return of(product).pipe(
      delay(300),
      map((p) => {
        if (this._products().some((x) => x.code === p.code)) {
          throw new Error('Product with this code already exists.');
        }
        this._products.update((list) => [...list, p]);
        return p;
      }),
    );
  }

  update(product: Product): Observable<Product> {
    return of(product).pipe(
      delay(300),
      map((p) => {
        this._products.update((list) => list.map((x) => (x.code === p.code ? p : x)));
        return p;
      }),
    );
  }
}
