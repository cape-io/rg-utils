import _ from 'lodash/fp.js'
import { setFieldWith } from 'prairie'
import info from './info.js' // downloaded/updated via `npm up`
import { ANY_CAT } from './cat-ids.js'

// Collection of values and helper functions based on schema/yaml files.
const byId = _.keyBy('id')
const { categories } = info
const fields = info.fields.map(setFieldWith('optCodeId', 'optIdCode', _.invert))
export const fieldById = byId(fields)
export const catsById = byId(categories)
export const getCatById = _.propertyOf(catsById)
export const getCategoryField = _.flow(getCatById, _.defaultTo(catsById[ANY_CAT]))

// Filters filterOptions
const getFilterFields = _.filter({ filter: true })
export const filterFields = getFilterFields(fields)
export const filterFieldsById = byId(filterFields)
export const getFiltersCount0 = () => _.mapValues(
  ({ optIdCode }) => _.mapValues(_.constant(0), optIdCode),
  filterFieldsById,
)

const getFilterFieldCodes = _.flow(_.map(_.at(['code', 'id'])), _.fromPairs)
// filterFieldCodes
export const fieldCodes = getFilterFieldCodes(filterFields)
export const filterFieldCodes = _.keys(fieldCodes)
// filterFieldIds
const fieldIds = _.invert(fieldCodes)

// Convert codes to ids.
function optIdSearchReducer(result, [key, value]) {
  const id = fieldCodes[key]
  if (!id) return _.set(key, value, result)
  const { optCodeId } = fieldById[id]
  const vals = value.map(_.propertyOf(optCodeId))
  if (id === 'category') return _.set('matches.categoryId', _.first(vals), result)
  return _.set(id, vals, result)
}
export const toOptIdSearch = (x) => _.toPairs(x).reduce(optIdSearchReducer, {})

// Convert ids to codes.
function optCodeSearchReducer(result, [key, value]) {
  const id = (key === 'categoryId') ? 'category' : key
  const code = fieldIds[id]
  if (!code) return _.set(id, value, result)
  const { optIdCode } = fieldById[id]
  const getCode = _.propertyOf(optIdCode)
  const vals = _.isArray(value) ? value.map(getCode).filter(_.identity) : [getCode(value)]
  if (_.isEmpty(vals)) return result
  // NOTE: field id values will overwrite code values.
  return _.set(code, vals, result)
}
export const toOptCodeSearch = (x) => _.toPairs(x).reduce(optCodeSearchReducer, {})

export {
  categories,
}
