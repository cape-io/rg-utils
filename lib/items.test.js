import _ from 'lodash/fp.js'
import { getPatternColorItems } from './items.js'
import { hasImage } from './image.js'

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

describe('getPatternColorItems', () => {
  const colorItems = getPatternColorItems(pattern)
  // console.log(colorItems.map(_.get('pattern.colorItems')))
  test('create color item array from pattern', () => {
    expect(colorItems.length).toBe(2)
  })
  const item = _.last(colorItems)
  test('Should have pattern prop', () => {
    expect(item.pattern.patternId).toBe(pattern.patternId)
  })
  test('Should have pattern colorItems', () => {
    expect(item.pattern.colorItems.length).toBe(2)
  })
  test('no pattern prop on pattern children', () => {
    expect(_.last(item.pattern.colorItems).pattern).toBe(undefined)
  })
})

describe('hasImage checks for images', () => {
  const colorItem = {
    ...pattern.colorItems[0],
  }
  test('no images', () => {
    // undefined
    expect(hasImage(colorItem)).toBe(false)
    colorItem.images = null
    expect(hasImage(colorItem)).toBe(false)
    colorItem.images = {}
    expect(hasImage(colorItem)).toBe(false)
    colorItem.images = []
    expect(hasImage(colorItem)).toBe(false)
  })
  test('with images', () => {
    colorItem.images = { normal: {} }
    expect(hasImage(colorItem)).toBe(true)
  })
})
