import React from 'react'
export { wrapRootElement } from './src/wrapRoot'

const themeJs = "try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}"

export const onRenderBody = ({ setHeadComponents }) =>
  setHeadComponents([
    <script key="t" dangerouslySetInnerHTML={{ __html: themeJs }} />,
    <link key="f" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" />,
    <link key="i" rel="icon" href="/favicon.svg" />,
  ])
