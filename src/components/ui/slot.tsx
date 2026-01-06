'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

function Slot({ children, ...props }: SlotProps) {
  if (!React.isValidElement(children)) {
    return null
  }

  const childProps = children.props as Record<string, unknown>

  return React.cloneElement(children, {
    ...props,
    ...childProps,
    className: cn(props.className, childProps.className as string | undefined),
    ref: (children as React.ReactElement & { ref?: React.Ref<unknown> }).ref,
  } as React.HTMLAttributes<HTMLElement>)
}

export { Slot }
