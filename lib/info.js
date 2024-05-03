import fields from './info-fields.js'
import categories from './info-cats.js'

export default {
  fields: fields.filter(({ id }) => id !== 'category'),
  categories,
}
