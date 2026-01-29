'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Only render on client to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return <>{children}</>
  }
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
