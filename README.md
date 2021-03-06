# rg-utils

Tools and utilities for R&G + D&L item ID and Category processing.

## ID Requirements

**{prefix}-{patternId}-{colorId}**

Prefer using a `patternSeparator` (`-`) between `prefix` and `patternId` when creating new prefix options.

Options are defined in `lib/cat-ids.js`. 

* `prefix` valid options are [null, p, l, dl, dli, dlt, pf, pft, pfi]. Max of 16 options including `null` (textile). 4 bits.
* `patternId` NUMBER must be less than 16777215. 24 bits.
* `colorId` NUMBER must be less than 64. 6 bits.

## ID Processing

* `getItemIdInfo(itemId)` Parsing of itemId into an object `{ patternId, colorId, otherId, invalidId: Boolean }`
* String must start with a valid `patternId` or it will not be processed.
* Pattern numbers over 9 are allowed. Pattern must have three or more letter chars.
* Double colorId will be turned into `01|02`. Able to parse as `01/02`, `01_02`, or `01-02`. Will mark as invalidId if used `_` or `/`.
* DL patternId prefix can have hyphen or not. Does not force to have or not.
* `otherId` is joined with underscore.
* `hasValidIdChars()` uses a regex expression to check if the id is in a known format.

## Category Processing

- `getCategoryFromPattern({ categories: { drapery: {patternIds: ['id1']}}})(item)` Establishing category. Item needs `patternId` and optionally a `category` field.

## ID Number
style = 7 bits (127)
sourceNum = 9 bits (511) Assume 489 is min for 5 length and higher?
length = 2 bits 0:4, 1:5, 2:6, 3:7

27 bits
source = 11 sourceNum | length
style = 7
colorId = 6
prefix = 3
