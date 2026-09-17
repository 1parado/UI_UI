export {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  chartPalette,
  useChart,
} from './Chart'
export type {
  ChartConfig,
  ChartContainerProps,
  ChartLegendProps,
  ChartSeriesConfig,
  ChartTooltipContentProps,
  ChartTooltipItem,
  ChartTooltipProps,
} from './Chart'

/**
 * The chart primitives come from recharts, which is a regular dependency of
 * this package. Re-exported here so a consumer can build a chart without
 * adding recharts to their own `package.json` — and so the version that draws
 * the marks is the one `ChartContainer` was tested against.
 *
 * This is the whole surface a chart needs: a plot, a mark per series, axes and
 * a grid. Anything beyond it (`Sankey`, `Treemap`, `RadarChart`) is still
 * reachable from `recharts` directly.
 */
export {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
