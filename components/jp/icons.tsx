import type { ReactNode, SVGProps } from "react"

type IcoProps = Omit<SVGProps<SVGSVGElement>, "d" | "stroke"> & {
  d: ReactNode
  size?: number
  fill?: string
  stroke?: number
}

function Ico({ d, size = 22, fill, stroke = 1.6, ...p }: IcoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill || "none"}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      {d}
    </svg>
  )
}

type P = Omit<IcoProps, "d">

export const Icons = {
  grid: (p: P) => (
    <Ico
      {...p}
      d={
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.6" />
          <rect x="14" y="3" width="7" height="7" rx="1.6" />
          <rect x="3" y="14" width="7" height="7" rx="1.6" />
          <rect x="14" y="14" width="7" height="7" rx="1.6" />
        </>
      }
    />
  ),
  signals: (p: P) => <Ico {...p} d={<path d="M3 12h3l2.5-6 4 13 3-9 1.8 4H21" />} />,
  chart: (p: P) => (
    <Ico
      {...p}
      d={
        <>
          <path d="M3 3v18h18" />
          <path d="M7 14l3.2-4 3 2.4L20 6" />
        </>
      }
    />
  ),
  bolt: (p: P) => <Ico {...p} d={<path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />} fill="currentColor" stroke={0} />,
  radar: (p: P) => (
    <Ico
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 12 19 7" />
        </>
      }
    />
  ),
  pulse: (p: P) => <Ico {...p} d={<path d="M2 12h4l2-7 4 14 2.5-7H22" />} />,
  gauge: (p: P) => (
    <Ico
      {...p}
      d={
        <>
          <path d="M4 18a8 8 0 1 1 16 0" />
          <path d="M12 18l4-5" />
        </>
      }
    />
  ),
  cpu: (p: P) => (
    <Ico
      {...p}
      d={
        <>
          <rect x="6" y="6" width="12" height="12" rx="2.5" />
          <path d="M9 1.5V4M15 1.5V4M9 20v2.5M15 20v2.5M1.5 9H4M1.5 15H4M20 9h2.5M20 15h2.5" />
        </>
      }
    />
  ),
  bars: (p: P) => <Ico {...p} d={<path d="M5 20V11M10 20V5M15 20v-6M20 20V8" />} />,
  search: (p: P) => (
    <Ico
      {...p}
      d={
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </>
      }
    />
  ),
  arrowUp: (p: P) => <Ico {...p} d={<path d="M12 19V5M6 11l6-6 6 6" />} />,
  arrowDn: (p: P) => <Ico {...p} d={<path d="M12 5v14M6 13l6 6 6-6" />} />,
  chevR: (p: P) => <Ico {...p} d={<path d="m9 6 6 6-6 6" />} />,
  filter: (p: P) => <Ico {...p} d={<path d="M3 5h18l-7 8v6l-4-2v-4z" />} />,
  clock: (p: P) => (
    <Ico
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </>
      }
    />
  ),
  shield: (p: P) => <Ico {...p} d={<path d="M12 3 4.5 6v6c0 5 3.5 7.5 7.5 9 4-1.5 7.5-4 7.5-9V6z" />} />,
  target: (p: P) => (
    <Ico
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </>
      }
    />
  ),
  flame: (p: P) => <Ico {...p} d={<path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-1.5.8-3 .8-3S9 11 10 11c0-3 2-8 2-8z" />} />,
  layers: (p: P) => (
    <Ico
      {...p}
      d={
        <>
          <path d="m12 3 9 5-9 5-9-5z" />
          <path d="m3 13 9 5 9-5" />
        </>
      }
    />
  ),
  check: (p: P) => <Ico {...p} d={<path d="M4 12l5 5L20 6" />} />,
  x: (p: P) => <Ico {...p} d={<path d="M6 6l12 12M18 6L6 18" />} />,
}

export type IconKey = keyof typeof Icons
