import _ from 'lodash/fp.js'
// import { setField } from 'prairie'
import { isGt } from 'understory'
import { filterFields, filterFieldsById, getFiltersCount0 } from './fields.js'

export const ACTIVE_FILTER_FIELD_IDS = ['colors', 'designs', 'contents']

// All this filterOpts stuff might not be required any longer.
const setCount0 = _.set('count', 0)
const byIdCount0 = _.flow(_.map(setCount0), _.keyBy('id'))
const optsToIndex = _.update('options', byIdCount0)

const setValNull = _.set('value', null)
const getFieldOpts = _.flow(setValNull, optsToIndex)

// send filterFieldsById
export const getFilterOpts = _.flow(
  _.pick(ACTIVE_FILTER_FIELD_IDS),
  _.mapValues(getFieldOpts),
)

// Has field value and option count empty. Limited to ACTIVE_FILTER_FIELD_IDS.
export const filterOpts = getFilterOpts(filterFieldsById)

// (search) => setField(
//   'value',
//   ({ options, id }) => (search[id] ? options.find(_.matches({ id: search[id] })) : null),
// )

const addFieldCount = _.curry((filterCounts, fieldId, val) => {
  if (!_.isNumber(_.get([fieldId, val], filterCounts))) {
    console.error(`ERR addFieldCount val not found! ${fieldId}: ${val}`)
  }
  // eslint-disable-next-line no-param-reassign
  filterCounts[fieldId][val] += 1
})

// filterOpts passed by ref
function addItemValsCount(filterCounts, colorItem) {
  filterFields.forEach(({ id, valuePath }) => {
    const value = _.get(valuePath, colorItem)
    if (!value) return
    if (_.isArray(value)) {
      value.forEach(addFieldCount(filterCounts, id))
    } else {
      addFieldCount(filterCounts, id, value)
    }
  })
}

// colorItems should be the result of a search.
export function getFilterCounts(colorItems) {
  // Every time because we pass this by ref. Maybe perf gain?
  const filterCounts = getFiltersCount0(filterFieldsById)
  colorItems.forEach((colorItem) => {
    addItemValsCount(filterCounts, colorItem)
  })
  return filterCounts
}

export const keysAbove0 = _.mapValues(_.pickBy(isGt(0)))

export const getFiltersWithCounts = _.flow(getFilterCounts, keysAbove0)
