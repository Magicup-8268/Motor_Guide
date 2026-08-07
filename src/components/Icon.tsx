import type { ReactNode, SVGProps } from 'react'

export type IconName =
  | 'arrow-up-right'
  | 'bookmark'
  | 'check'
  | 'chevron-down'
  | 'copy'
  | 'grid'
  | 'install'
  | 'moon'
  | 'search'
  | 'share'
  | 'sliders'
  | 'spark'
  | 'sun'
  | 'x'

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
}

const paths: Record<IconName, ReactNode> = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  share: <><circle cx="18" cy="5" r="2.25" /><circle cx="6" cy="12" r="2.25" /><circle cx="18" cy="19" r="2.25" /><path d="m8.1 10.95 7.8-4.1M8.1 13.05l7.8 4.1" /></>,
  'arrow-up-right': <><path d="M6 18 18 6" /><path d="M9 6h9v9" /></>,
  bookmark: <path d="M7 4.75A1.75 1.75 0 0 1 8.75 3h6.5A1.75 1.75 0 0 1 17 4.75V21l-5-3-5 3V4.75Z" />,
  copy: <><rect x="9" y="9" width="10" height="10" rx="1.5" /><path d="M15 9V6.5A1.5 1.5 0 0 0 13.5 5h-8A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16H9" /></>,
  grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  install: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
  sliders: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" /><circle cx="15" cy="17" r="2" /></>,
  spark: <path d="m12 3 1.65 5.35L19 10l-5.35 1.65L12 17l-1.65-5.35L5 10l5.35-1.65L12 3Zm6 13 0 4m2-2h-4M5 3v4m2-2H3" />,
  check: <path d="m5 12 4.2 4L19 6.5" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.55 1.55m11.1 11.1 1.55 1.55m0-14.2-1.55 1.55M6.45 17.55 4.9 19.1" /></>,
  x: <path d="m6 6 12 12M18 6 6 18" />,
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
