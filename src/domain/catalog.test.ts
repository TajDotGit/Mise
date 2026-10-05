import { ing, testCatalog, testItems } from '../test/factories';
import { editDistance, searchCatalog, sortCatalog, validateAgainstCatalog } from './catalog';

const names = (q: string) => searchCatalog(testItems, q).map((i) => i.name);

describe('searchCatalog', () => {
  it('ignores case and surrounding spaces', () => {
    expect(names('  CHEDDAR ')[0]).toBe('Cheddar');
  });

  it('tolerates small typos', () => {
    expect(names('cheddr')[0]).toBe('Cheddar');
    expect(names('chiken')[0]).toBe('Chicken breast');
    expect(names('spinnach')[0]).toBe('Baby spinach');
  });

  it('matches aliases', () => {
    expect(names('coriander')).toEqual(['Cilantro']);
  });

  it('ranks prefix matches above word and substring matches', () => {
    const items = searchCatalog(testItems, 'on').map((i) => i.id);
    expect(items[0]).toBe('onion');
  });

  it('does not fuzzy-match very short queries', () => {
    expect(names('xq')).toEqual([]);
  });

  it('returns the whole catalog in aisle order for an empty query', () => {
    expect(searchCatalog(testItems, '')).toEqual(sortCatalog(testItems));
    expect(searchCatalog(testItems, '')[0]?.section).toBe('produce');
  });
});

describe('editDistance', () => {
  it('counts insertions, deletions, and substitutions', () => {
    expect(editDistance('cheddr', 'cheddar')).toBe(1);
    expect(editDistance('kitten', 'sitting')).toBe(3);
    expect(editDistance('abc', 'abc')).toBe(0);
  });
  it('stops early past the limit', () => {
    expect(editDistance('aaaaaaa', 'bbbbbbb', 2)).toBe(3);
  });
});

describe('validateAgainstCatalog', () => {
  it('rejects unknown ingredients and units the ingredient is not measured in', () => {
    expect(validateAgainstCatalog([ing('onion', 1, 'each'), ing('mystery', 1, 'each'), ing('onion', 1, 'lb')], testCatalog)).toEqual([
      { index: 1, field: 'ingredientId', message: 'Pick an ingredient from the list' },
      { index: 2, field: 'unit', message: 'Use each' },
    ]);
  });
});
