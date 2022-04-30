import { getPatternColorItems, getItemColorPosition } from './items.js'

/* global describe, expect, test */

const pattern = {
  patternId: '91024',
  approxWidth: '61"',
  category: 'textile',
  content: '100%&nbsp;Linen',
  contents: [
    'linen',
  ],
  designs: [
    'solid',
  ],
  discontinued: false,
  fullPatternView: false,
  lengthUnit: 'Yards',
  miscellaneous: 'A, D, SC, U',
  name: '18 Oz. Linen',
  originCountry: 'Italy',
  repeat: null,
  reversible: false,
  usage: [],
  weight: 24,
  colorItems: [
    {
      itemId: '91024-03',
      colorId: '03',
      color: 'Leaf',
      colorPosition: 9999,
      colorPrimary: 'green',
      dateModified: 1643143551038,
      discontinued: true,
      id: '91024-03',
      price: 47,
    },
    {
      itemId: '91024-10',
      colorId: '10',
      color: 'Mane',
      colorPosition: 8999,
      colorPrimary: 'gold',
      dateModified: 1643143551038,
      discontinued: true,
      id: '91024-10',
      price: 47,
    },
  ],
}

const colorItems = getPatternColorItems(pattern)
describe('getPatternColorItems', () => {
  test('create color item array from pattern', () => {
    expect(colorItems.length).toBe(2)
  })
})
