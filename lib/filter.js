import _ from 'lodash/fp.js'
// import { setField } from 'prairie'

export const ACTIVE_FILTER_FIELD_IDS = ['colors', 'designs', 'contents']

const setValNull = _.set('value', null)
const setCount0 = _.set('count', 0)
const byIdCount0 = _.flow(_.map(setCount0), _.keyBy('id'))
const optsToIndex = _.update('options', byIdCount0)

// (search) => setField(
//   'value',
//   ({ options, id }) => (search[id] ? options.find(_.matches({ id: search[id] })) : null),
// )

const getFieldOpts = _.flow(setValNull, optsToIndex)

// send filterFieldsById
export const getFilterOpts = _.flow(
  _.pick(ACTIVE_FILTER_FIELD_IDS),
  _.mapValues(getFieldOpts),
)
