import _ from 'lodash/fp.js'
import { isGt } from 'understory'

export const IMAGES = 'images'
export const NORMAL_IMG = 'normal'

export const getImgs = _.get(IMAGES)
export const imageCount = _.flow(getImgs, _.size)
// colorItem has images
export const hasImage = _.flow(imageCount, isGt(0))

export const getItemImgPath = (patternId, colorId, keyword = NORMAL_IMG) => `pattern/${patternId}/${colorId}-${keyword}.jpg`

export const itemImgPath = (
  { pattern: { patternId }, colorId },
  keyword,
) => getItemImgPath(patternId, colorId, keyword)
export const getNormalByKeyword = _.find({ keyword: NORMAL_IMG })
export function getNormalImg(x) {
  if (!x) return null
  return _.get(NORMAL_IMG, x) || getNormalByKeyword(x)
}

// Always assume image details has no path.
export function normalImgPath(colorItem) {
  const images = getImgs(colorItem)
  // assume if we have ANY images that one of them is normal...
  return (getNormalImg(images) ? itemImgPath(colorItem, NORMAL_IMG) : null)
}
// Always return a path, even if no images.
export function getNormalImgPath(colorItem, pattern) {
  const images = getImgs(colorItem)
  if (images) {
    const normalImg = getNormalImg(images)
    if (normalImg) return normalImg.path
  }
  if (!colorItem.pattern && !pattern) {
    console.error('The colorItem needs a pattern property to build an image path.', colorItem)
    return null
  }
  // Create path.
  if (pattern) return getItemImgPath(pattern.patternId, colorItem.colorId)
  return itemImgPath(colorItem, NORMAL_IMG)
}
