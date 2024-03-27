import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  widget,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  LanguageCode,
  IPositionLineAdapter,
} from './charting_library/charting_library'
import Datafeed from './datafeed'
import { isPerpsApp } from './datafeed/constants'

export type ChartLine = {
  price: number;
  title: string;
};
interface ChartContainerProps extends ChartingLibraryWidgetOptions {
  symbol: ChartingLibraryWidgetOptions['symbol']
  interval: ChartingLibraryWidgetOptions['interval']
  darkMode?: boolean
  currentIndex?: any
  compareSymbols?: Array<string>
  libraryPath: ChartingLibraryWidgetOptions['library_path']
  clientId: ChartingLibraryWidgetOptions['client_id']
  userId: ChartingLibraryWidgetOptions['user_id']
  fullscreen: ChartingLibraryWidgetOptions['fullscreen']
  autosize: ChartingLibraryWidgetOptions['autosize']
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides']
  container: ChartingLibraryWidgetOptions['container']
  theme?: ChartingLibraryWidgetOptions['theme']
  defaultLines?: number
  chartLines: ChartLine[];
}

export const TVChart: React.FC<Partial<ChartContainerProps>> = (props) => {
  const { chartLines } = props
  const ref = useRef<HTMLDivElement>(null)
  const tvWidget = useRef<IChartingLibraryWidget | null>(null)
  const [chartReady, setChartReady] = useState(false)

  useEffect(() => {
    const initWidget = () => {
      if (!ref.current) return

      const widgetOptions: ChartingLibraryWidgetOptions = {
        symbol: props.symbol || 'ETH',
        // @ts-ignore
        datafeed: Datafeed,
        interval: props.interval || ('15' as ResolutionString),
        container: ref.current,
        library_path: props.libraryPath || '/charting_library/',
        locale: (navigator.language.slice(0, 2) as LanguageCode) || 'en',
        disabled_features: [
          'use_localstorage_for_settings',
          isPerpsApp() ? 'header_symbol_search' : '',
          isPerpsApp() ? 'header_compare' : '',
        ],
        enabled_features: [],
        theme: props.darkMode ? 'Dark' : 'Light',
        client_id: props.clientId || 'tradingview.com',
        user_id: props.userId || 'public_user_id',
        fullscreen: props.fullscreen || false,
        toolbar_bg: 'transparent',
        autosize: props.autosize || true,
        studies_overrides: props.studiesOverrides || {},
        overrides: {
          'paneProperties.background': props.darkMode ? 'rgba(13, 12, 19, 1)' : 'rgb(249, 250, 251)',
          'mainSeriesProperties.candleStyle.wickUpColor': 'rgb(51,215,120)',
          'mainSeriesProperties.candleStyle.upColor': 'rgb(51,215,120)',
          'mainSeriesProperties.candleStyle.borderUpColor': 'rgb(51,215,120)',
          'paneProperties.legendProperties.showSeriesTitle': false,
          'scalesProperties.showSymbolLabels': true,
        },
        custom_css_url: '../tvcharts.css',
        compare_symbols: [
          { symbol: 'EVIV', title: 'Volmex Ethereum Implied Volatility Index' },
          { symbol: 'BVIV', title: 'Volmex Bitcoin Implied Volatility Index' },
          { symbol: 'EVRV', title: 'Volmex Ethereum Realized Volatility Index' },
          { symbol: 'BVRV', title: 'Volmex Bitcoin Realized Volatility Index' },
          { symbol: 'EVRP', title: 'Volmex Ethereum Risk Premium Index' },
          { symbol: 'BVRP', title: 'Volmex Bitcoin Risk Premium Index' },
          { symbol: 'EVCORR1W', title: 'Volmex Ethereum Spot Volatility 1 Week Correlation Index' },
          { symbol: 'BVCORR1W', title: 'Volmex Bitcoin Spot Volatility 1 Week Correlation Index' },
        ],
      }

      tvWidget.current = new widget(widgetOptions)

      if (props.darkMode) {
        tvWidget.current.applyOverrides({
          'paneProperties.background': 'rgba(13, 12, 19, 1)',
          'paneProperties.backgroundType': 'solid',
        })
      }

      tvWidget.current.onChartReady(() => {
        tvWidget.current!.headerReady().then(() => {
          tvWidget.current!.chart().setChartType(props.defaultLines ?? 3)

          if (props.compareSymbols) {
            for (const symbol of props.compareSymbols) {
              tvWidget.current!.chart().createStudy('Compare', true, false, ['open', symbol])
            }
            // @ts-ignore
            tvWidget.current!.chart().applyOverrides({ 'scalesProperties.showSymbolLabels': true })
          }
        })
      })
    }

    initWidget()

    return () => {
      if (tvWidget.current !== null) {
        tvWidget.current.remove()
        tvWidget.current = null
        setChartReady(false)
      }
    }
  }, [])

  useEffect(() => {
    if (tvWidget.current !== null) {
      tvWidget.current.onChartReady(() => {
        setChartReady(true)
        const themeName = tvWidget.current!.getTheme()
        if (themeName.toLowerCase() === 'dark' && !props.darkMode) {
          tvWidget.current!.changeTheme('Light')
        } else if (themeName.toLowerCase() === 'light' && props.darkMode) {
          tvWidget.current!.changeTheme('Dark')
        }

        tvWidget.current!.setSymbol(props.symbol || 'EVIV', '15' as ResolutionString, () => {})
        tvWidget.current!.chart().removeAllStudies()

        if (props.compareSymbols) {
          for (const symbol of props.compareSymbols) {
            tvWidget.current!.chart().createStudy('Compare', true, false, ['open', symbol])
          }
        }
      })
    }
  }, [props.darkMode, props.symbol, props.interval, props.compareSymbols])

  const drawLineOnChart = useCallback(
    (title: string, price: number, color: string) => {
      if (chartReady && tvWidget.current?.activeChart?.().dataReady(() => {})) {
        const chart = tvWidget.current.activeChart()
        const positionLine = chart.createPositionLine({ disableUndo: true })

        return positionLine
          .setText(title)
          .setPrice(price)
          .setQuantity('')
          .setLineStyle(1)
          .setLineLength(1)
          .setBodyFont(`normal 12pt "Relative", sans-serif`)
          .setBodyTextColor('#fff')
          .setLineColor(color)
          .setBodyBackgroundColor(color)
          .setBodyBorderColor(color)
      }
    },
    [chartReady]
  )

  useEffect(
    function updateLines() {
      const lines: (IPositionLineAdapter | undefined)[] = []
      chartLines?.forEach((order) => {
        lines.push(drawLineOnChart(order.title, order.price, '#3a3e5e'))
      })
      return () => {
        lines.forEach((line) => line?.remove())
      }
    },
    [chartLines, drawLineOnChart]
  )
  //TODO: add arrows when when user when long or short
  // TODO: update update lines to should when u
  return <div className="h-full w-full" ref={ref} />
}

export default TVChart
