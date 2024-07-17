import React, { ReactNode } from 'react'

import { CSSTransition } from 'react-transition-group'

export const Fade = ({
  children,
  show,
}: {
  children: ReactNode
  show: boolean
}) => (
  <CSSTransition in={show} timeout={300} classNames="fade" unmountOnExit>
    {children}
  </CSSTransition>
)
