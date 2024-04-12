import _ from 'lodash/fp.js'
import { setField } from 'prairie'

// pgIndex is actual index in array, starting with 0.
export function getPagerInfo(itemsTotal, perPage, pgIndex) {
  // How many pages total. Round up because any items on a page another page.
  const pageCount = Math.ceil(itemsTotal / perPage)
  const maxIndex = pageCount - 1
  const pageIndex = Math.max(0, Math.min(maxIndex, pgIndex))
  const hasNextPage = pageIndex < maxIndex
  // Figure out details for each page.
  return {
    perPage,
    itemsTotal,
    itemsOnPage: hasNextPage ? perPage : itemsTotal % perPage,
    pageCount,
    pageIndex,
    maxIndex,
    currentPage: pageIndex + 1,
    skip: pageIndex * perPage, // zero indexed
    hasNextPage,
    hasPreviousPage: pageIndex > 0,
  }
}

const getDefaultPageSize = ({ defaultPgSizeIndex, pgSizeMultiplier, pgSizes }) => (
  pgSizes[defaultPgSizeIndex] * pgSizeMultiplier
)
const getPageSizes = ({ pgSizeMultiplier, pgSizes }) => _.initial(pgSizes)
  .map(_.flow(
    _.multiply(pgSizeMultiplier),
    (value) => ({ value, label: `${value}` }),
  )).concat([{
    value: pgSizeMultiplier * _.last(pgSizes),
    label: 'All',
  }])

export const getPagerMeta = _.flow(
  setField('pageSizes', getPageSizes),
  setField('perPageDefault', getDefaultPageSize),
)
