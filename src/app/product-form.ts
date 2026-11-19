import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CODE_PATTERN, FLOORS, Product, SECTIONS } from './product';
import { ProductService } from './product.service';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm implements OnInit {
  private readonly productService = inject(ProductService);

  // ako je product prosleđen -> izmena, inače -> dodavanje
  readonly product = input<Product>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly floors = FLOORS;
  protected readonly sections = SECTIONS;
  protected readonly saving = signal(false);
  protected readonly error = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group({
    code: ['', [Validators.required, Validators.pattern(CODE_PATTERN)]],
    quantity: [1, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    floor: [FLOORS[0], Validators.required],
    section: [SECTIONS[0], Validators.required],
  });

  ngOnInit() {
    const product = this.product();
    if (product) {
      this.form.setValue(product);
      this.form.controls.code.disable(); // šifra se ne može menjati
    }
  }

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // getRawValue() uključuje i disabled polje (code)
    const value = this.form.getRawValue();
    const request$ = this.product()
      ? this.productService.update(value)
      : this.productService.add(value);

    this.saving.set(true);
    this.error.set('');

    request$.subscribe({
      next: () => this.saved.emit(),
      error: (err: Error) => {
        this.error.set(err.message);
        this.saving.set(false);
      },
    });
  }
}
