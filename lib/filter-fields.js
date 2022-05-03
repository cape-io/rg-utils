import _ from 'lodash/fp.js'
import { onTrue } from 'understory'
import {
  replaceField, setField, setFieldWith,
} from 'prairie'
// import { readJsonSync } from 'fs-extra'
// import categories from '../../static/categories.json'

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

// Promise.all([
//   fetch('https://data.rogersandgoffigon.com/info/fields.json'),
//   fetch('https://data.rogersandgoffigon.com/info/categories.json'),
// ]).then((x) => Promise.all(x.map(_.method('json'))))
//   .then(([fields, categories]) => createFilterFields(categories, fields))
//   .then(console.log)
