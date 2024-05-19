import { oneOf } from 'understory'

export const APP_RG = 'rg'
export const APP_DL = 'dl'
export const APP_CODE = 'rg'
export const APP_CODES = [APP_RG, APP_DL]
export const isAppCode = oneOf(APP_CODES)
