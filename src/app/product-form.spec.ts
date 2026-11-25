import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { Product } from './product';
import { ProductForm } from './product-form';
import { ProductService } from './product.service';

describe('ProductForm', () => {
  let fixture: ComponentFixture<ProductForm>;
  let productService: {
    add: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    productService = {
      add: vi.fn(),
      update: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [{ provide: ProductService, useValue: productService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductForm);
  });

  it('starts with default form values', () => {
    fixture.detectChanges();

    const form = (fixture.componentInstance as unknown as {
      form: { value: Record<string, unknown> };
    }).form;

    expect(form.value).toEqual({
      code: '',
      quantity: 1,
      floor: 1,
      section: 1,
    });
  });

  it('does not submit an invalid form', () => {
    fixture.detectChanges();

    const form = (fixture.componentInstance as unknown as {
      form: { invalid: boolean; markAllAsTouched: () => void };
    }).form;

    (fixture.componentInstance as unknown as { submit: () => void }).submit();

    expect(form.invalid).toBe(true);
    expect(productService.add).not.toHaveBeenCalled();
    expect(productService.update).not.toHaveBeenCalled();
  });

  it('adds a valid product and emits saved', () => {
    const product: Product = {
      code: 'ABC 1234',
      quantity: 5,
      floor: 2,
      section: 3,
    };
    productService.add.mockReturnValue(of(product));

    fixture.detectChanges();

    const form = (fixture.componentInstance as unknown as {
      form: { setValue: (value: Product) => void };
    }).form;
    form.setValue(product);

    const saved = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);

    (fixture.componentInstance as unknown as { submit: () => void }).submit();

    expect(productService.add).toHaveBeenCalledWith(product);
    expect(saved).toHaveBeenCalledOnce();
  });

  it('loads an existing product and disables editing its code', () => {
    const product: Product = {
      code: 'MYTZ 123456',
      quantity: 100,
      floor: 1,
      section: 3,
    };

    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();

    const form = (fixture.componentInstance as unknown as {
      form: {
        controls: { code: { disabled: boolean; value: string } };
        value: Record<string, unknown>;
      };
    }).form;

    expect(form.controls.code.value).toBe(product.code);
    expect(form.controls.code.disabled).toBe(true);
  });

  it('shows a service error and allows retrying', () => {
    const product: Product = {
      code: 'XYZ 12345',
      quantity: 3,
      floor: 1,
      section: 2,
    };

    productService.add
      .mockReturnValueOnce(throwError(() => new Error('Could not add product')))
      .mockReturnValueOnce(of(product));

    fixture.detectChanges();

    const form = (fixture.componentInstance as unknown as {
      form: { setValue: (value: Product) => void };
    }).form;
    form.setValue(product);

    (fixture.componentInstance as unknown as { submit: () => void }).submit();

    const state = fixture.componentInstance as unknown as {
      error: { (): string };
      saving: { (): boolean };
    };

    expect(state.error()).toBe('Could not add product');
    expect(state.saving()).toBe(false);

    (fixture.componentInstance as unknown as { submit: () => void }).submit();

    expect(productService.add).toHaveBeenCalledTimes(2);
    expect(state.error()).toBe('');
  });
});
