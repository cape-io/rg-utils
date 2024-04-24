// pgIndex is actual index in array, starting with 0.
export function getPagerInfo(itemsTotal, perPage = 1, pgIndex = 1) {
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
    startIndex: pageIndex * perPage,
    endIndex: (pageIndex + 1) * perPage,
    pageCount,
    pageIndex,
    maxIndex,
    currentPage: pageIndex + 1,
    skip: pageIndex * perPage, // zero indexed
    hasNextPage,
    hasPreviousPage: pageIndex > 0,
  }
}
export const pager = true
