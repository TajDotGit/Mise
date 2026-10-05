import { testCatalog } from '../../test/factories';
import { parseDraft, toDraft } from './formModel';

describe('parseDraft', () => {
  const base = { ...toDraft(), name: 'Rice', ingredients: [{ ingredientId: 'rice', quantity: '1', unit: 'cup' as const }] };

  it('drops blank steps and converts optional fields', () => {
    const r = parseDraft({ ...base, steps: ['Rinse', '  ', 'Boil'], cookMinutes: '20', link: ' https://www.example.com/x ' }, testCatalog);
    expect(r).toMatchObject({ ok: true, value: { steps: ['Rinse', 'Boil'], cookMinutes: 20, link: 'https://www.example.com/x' } });
  });

  it('asks for a picked ingredient instead of complaining about units', () => {
    const r = parseDraft({ ...base, ingredients: [{ ingredientId: '', quantity: '1', unit: '' }] }, testCatalog);
    expect(r).toEqual({ ok: false, errors: { 'ingredients.0.ingredientId': 'Pick an ingredient from the list' } });
  });

  it('rejects unsafe links and bad numbers', () => {
    const r = parseDraft({ ...base, link: 'javascript:alert(1)', cookMinutes: 'abc' }, testCatalog);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.link).toMatch(/https/);
      expect(r.errors.cookMinutes).toBe('Enter a number');
    }
  });
});
