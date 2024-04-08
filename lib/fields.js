import _ from 'lodash/fp.js'
import { setFieldWith } from 'prairie'
import info from './info.js' // downloaded/updated via `npm up`

// Collection of values and helper functions based on schema/yaml files.

const { categoryCodes } = info

const fields = info.fields.map(setFieldWith('optCodeId', 'optIdCode', _.invert))
const fieldById = _.keyBy('id', fields)

const getFilterFieldCodes = _.flow(_.filter({ filter: true }), _.map(_.at(['code', 'id'])), _.fromPairs)
const fieldCodes = getFilterFieldCodes(fields)
const fieldIds = _.invert(fieldCodes)

function optIdSearchReducer(result, [key, value]) {
  const id = fieldCodes[key]
  if (!id) return _.set(key, value, result)
  const { optCodeId } = fieldById[id]
  const vals = value.map(_.propertyOf(optCodeId))
  if (id === 'category') return _.set('matches.categoryId', _.first(vals), result)
  return _.set(id, vals, result)
}
const toOptIdSearch = (x) => _.toPairs(x).reduce(optIdSearchReducer, {})

function optCodeSearchReducer(result, [key, value]) {
  const id = (key === 'categoryId') ? 'category' : key
  const code = fieldIds[id]
  if (!code) return _.set(id, value, result)
  const { optIdCode } = fieldById[id]
  const getCode = _.propertyOf(optIdCode)
  const vals = _.isArray(value) ? value.map(getCode) : [getCode(value)]
  return _.set(code, vals, result)
}
const toOptCodeSearch = (x) => _.toPairs(x).reduce(optCodeSearchReducer, {})

export const filterFieldCodes = _.keys(fieldCodes)

// key with search hash code.
export const catCodeId = _.invert(categoryCodes)
export const getCatAlias = (hash) => ((catCodeId[hash]) ? catCodeId[hash] : hash)

function getSimpleSearch() {
  const categories = _.fromPairs(fields.find(_.matches({ id: 'category' })).options.map(({ id, slug }) => ([slug || id, { categoryId: id }])))
  const colors = _.fromPairs(
    fields.find(_.matches({ id: 'colors' }))
      .options.map(({ id }) => ([`^${id}`, { matches: { colorPrimary: id } }])),
  )
  const catCodes = _.flow(
    _.invert,
    _.mapValues((category) => ({ categoryId: category })),
  )(categoryCodes)
  delete categories.linen
  delete categories.drapery
  return {
    ...catCodes,
    ...categories,
    ...colors,
  }
}

export default {
  categoryCodes,
  filterFieldCodes,
  getCatAlias,
  fieldCodes,
  optSearch: {},
  simpleSearch: getSimpleSearch(),
  toOptIdSearch,
  toOptCodeSearch,
}

export {
  categoryCodes,
  fieldCodes,
}
