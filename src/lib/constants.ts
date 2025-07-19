/**
 * Application constants and configuration
 * Centralized for easy internationalization and maintenance
 */

export const APP_NAME = 'ToxiMeter'
export const APP_DESCRIPTION = 'Relationship Toxicity Assessment Tool'

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  SHARE: '/share',
} as const

export const TIER_COLORS = {
  Healthy: 'text-green-500',
  Manageable: 'text-yellow-500', 
  Concerning: 'text-orange-500',
  Toxic: 'text-red-500',
} as const

export const TIER_BACKGROUNDS = {
  Healthy: 'bg-green-500/20',
  Manageable: 'bg-yellow-500/20',
  Concerning: 'bg-orange-500/20', 
  Toxic: 'bg-red-500/20',
} as const

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
] as const

export const STORAGE_KEYS = {
  THEME: 'toximeter-theme',
  LAST_RESULT: 'toximeter-last-result',
} as const
