import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FLOORS, Product, SECTIONS } from './product';
import { ProductService } from './product.service';
import { ProductForm } from './product-form';

@Component({
  selector: 'app-root',
  imports: [ProductForm],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly floors = FLOORS;
  protected readonly sections = SECTIONS;

  private readonly products = inject(ProductService).products;

  // stanje filtera
  protected readonly search = signal('');
  protected readonly floor = signal<number | null>(null);
  protected readonly section = signal<number | null>(null);

  // stanje forme
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Product | undefined>(undefined);

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.products().filter(
      (p) =>
        p.code.toLowerCase().includes(term) &&
        (this.floor() === null || p.floor === this.floor()) &&
        (this.section() === null || p.section === this.section()),
    );
  });

  // klik na već izabran sprat/sekciju skida filter
  protected toggleFloor(floor: number) {
    this.floor.update((current) => (current === floor ? null : floor));
  }

  protected toggleSection(section: number) {
    this.section.update((current) => (current === section ? null : section));
  }

  protected openForm(product?: Product) {
    this.editing.set(product);
    this.formOpen.set(true);
  }

  protected closeForm() {
    this.formOpen.set(false);
  }
}
