import _ from 'lodash/fp.js'
import { getCategoryField } from './fields.js'

// Should something show up based on options
// shouldDisplayColumn(opts, column)
export const shouldDisplayColumn = _.curry(
  (
    { // item or section meta information
      displayStyle, isAnon, isPrint,
    },
    { // column information
      hideIfAnon, hideIfAuth, hideOnDetail, hideOnPrint, hideOnList, hideOnGrid,
    },
  ) => {
    if ((isAnon !== false) && hideIfAnon) return false
    if (displayStyle === 'detail' && hideOnDetail) return false
    if (displayStyle === 'list' && hideOnList) return false
    if (displayStyle === 'grid' && hideOnGrid) return false
    if (isPrint && hideOnPrint) return false
    if (isAnon === false && hideIfAuth) return false
    return true
  },
)
function customSort(opts, columns) {
  if (opts.displayStyle === 'list') {
    const { columnOrder } = getDisplayInfo('list')
    return _.sortBy(({ field }) => columnOrder.indexOf(field.id), columns)
  }
  return columns
}
export const fixColumns = (columns, opts, item) => customSort(opts, columns.filter(
  (column) => {
    const { field: { valuePath } } = column
    // Hide/remove column if no value found.
    if (_.isString(valuePath) && item && !_.get(valuePath, item)) return false
    return shouldDisplayColumn(opts, column)
  },
))

// getColumns(metaInfo, opts, item) item?.pattern?.category?.id
function getCatColumns(item, categoryId = 'any') {
  const catId = _.getOr(categoryId, 'pattern.category', item)
  const cols = getCategoryField(catId).columns
  return cols
}

// Check to see if the column has conditional updates like onArchive.
const columnModifications = _.curry(({ isArchive }, column) => {
  const { onArchive, ...rest } = column
  // Switch to i18n in the future?
  if (column.fieldId === 'price') rest.label = 'Price'
  if (isArchive && onArchive) {
    return { ...rest, ...onArchive }
  }
  return column
})

const setCatId = (metaInfo, categoryId) => _.set(
  'categoryId',
  (categoryId || metaInfo.categoryId || 'any'),
  metaInfo,
)
export function getCategoryColumns(info) {
  const category = getCategoryField(info.categoryId)
  if (!category) return []
  const categoryColumns = category
    .columns.map(columnModifications(info))
    .filter(shouldDisplayColumn(info))
  return categoryColumns
}

// Get the columns for a display section. Send pageMeta
export function getSectionColumns(pageMeta) {
  // Replace with ANY missing catId.
  const info = setCatId(pageMeta)
  return getCategoryColumns(info)
}

export function columnHasValue(item) {
  return ({ field }) => {
    const valPath = _.isArray(field.valuePath) ? field.valuePath[0] : field.valuePath
    const value = _.get(valPath, item) || _.get(item.id, item)
    return _.isString(value) || _.isNumber(value)
  }
}
export function getItemColumns(metaInfo) {
  return (item) => {
    const info = setCatId(metaInfo, item.pattern.category)
    return getCategoryColumns(info)
      .filter(columnHasValue(item))
  }
}
