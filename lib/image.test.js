import { NORMAL_IMG, itemImgPath } from './image.js'

/* global describe, expect, test */

const item = {
  pattern: {
    patternId: '9300010',
  },
  colorId: '04',
}
const keyword = NORMAL_IMG

describe('itemImgPath', () => {
  test('valid values', () => {
    expect(itemImgPath(item, keyword)).toBe('pattern/9300010/04-normal.jpg')
  })
})
