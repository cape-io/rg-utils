import _ from 'lodash/fp.js'
import { getFields } from 'prairie'
import { condId, isGt, isLt } from 'understory'

export const toUid = _.flow(
  _.trim,
  (x) => x.toLowerCase().replaceAll('o', '0'),
  _.trimCharsStart('0:-?'),
  _.padCharsStart('0', 6),
)
export const isUserId = _.flow(
  toUid,
  Number,
  _.overEvery([
    _.isFinite,
    isGt(23000),
    isLt(60000),
  ]),
)
export const toCustomerNumber = condId(
  [isUserId, toUid],
)
export const checkUserId = getFields({
  valid: isUserId,
  value: toCustomerNumber,
})
