# rg-utils

Tools and utilities for R&G + D&L item processing.

- Parsing of item id
- Establishing category.

## Changes/Notes

* Double colorId will be turned into `01|02`. Able to parse as `01/02`, `01_02`, or `01-02`.
* String must start with a valid `patternId` or it will not be processed.
* `otherId` is joined with underscore.
