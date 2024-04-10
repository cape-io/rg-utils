import _ from 'lodash/fp.js'
import { onTrue } from 'understory'
import {
  replaceField, setField, setFieldWith,
} from 'prairie'

// THIS ISN'T ACTUALLY USED NOW/YET!?

const fillOpt = (categories) => ({ id }) => _.find({ id }, categories).columns
const fillOpts = (categories) => _.map(setField('columns', fillOpt(categories))) // why?

function createOptSearch({ code, label, alias }) {
  return ([code, (alias ? `${alias.join(' ')} ${label}` : label)])
}
const createSearch = _.flow(_.map(createOptSearch), _.fromPairs)

const createFilterFields = (categories, fields) => _.flow(
  _.filter(_.overEvery([
    _.matches({ filter: true }),
    (x) => x.id !== 'tags',
  ])),
  _.map(_.flow(
    replaceField('options', (opts) => opts.map((x, index) => _.set('index', index, x))),
    onTrue(({ id }) => id === 'category', _.update('options', fillOpts(categories))),
    setFieldWith('optSearch', 'options', createSearch),
  )),
  _.sortBy('position'),
)(fields)
// export const filterFields = createFilterFields(fields)
// export const filterFieldsNoCat = _.tail(filterFields)
export default createFilterFields
