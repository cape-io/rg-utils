# rg-utils

Tools and utilities for R&G + D&L item processing.

- `getItemIdParts(itemId)` Parsing of item id into an object `{ patternId, colorId, otherId, invalidId: Boolean }`
- Establishing category.`

## Changes/Notes

* Double colorId will be turned into `01|02`. Able to parse as `01/02`, `01_02`, or `01-02`. Will mark as invalidId if used `_` or `/`.
* String must start with a valid `patternId` or it will not be processed.
* `otherId` is joined with underscore.
* `hasValidIdChars()` uses a regex expression to check if the id is in a known format.
