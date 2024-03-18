import * as React from 'react'
import {
  widget,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  LanguageCode,
} from './charting_library/charting_library'
import Datafeed from './datafeed'
import { isPerpsApp } from './datafeed/constants'

export interface ChartContainerProps extends ChartingLibraryWidgetOptions {
  symbol: ChartingLibraryWidgetOptions['symbol']
  interval: ChartingLibraryWidgetOptions['interval']
  darkMode?: boolean
  currentIndex?: any
  compareSymbols?: Array<string>
  // BEWARE: no trailing slash is expected in feed URL
  libraryPath: ChartingLibraryWidgetOptions['library_path']
  clientId: ChartingLibraryWidgetOptions['client_id']
  userId: ChartingLibraryWidgetOptions['user_id']
  fullscreen: ChartingLibraryWidgetOptions['fullscreen']
  autosize: ChartingLibraryWidgetOptions['autosize']
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides']
  container: ChartingLibraryWidgetOptions['container']
  theme?: ChartingLibraryWidgetOptions['theme']
  defaultLines?: number // bar klines area
}

export interface ChartContainerState {}

export class TVChart extends React.PureComponent<Partial<ChartContainerProps>, ChartContainerState> {
  public static defaultProps: Omit<ChartContainerProps, 'container'> = {
    symbol: 'ETH',
    interval: '15' as ResolutionString,
    libraryPath: '/charting_library/',
    clientId: 'tradingview.com',
    userId: 'public_user_id',
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
    defaultLines: 3, // lines
  }

  private tvWidget: IChartingLibraryWidget | null = null
  private ref: React.RefObject<HTMLDivElement> = React.createRef()

  public initWidget(): void {
    console.log('initWidget', this.props.symbol, this.props.interval)
    if (!this.ref.current) {
      return
    }

    const widgetOptions: ChartingLibraryWidgetOptions = {
      // change chart style to area
      symbol: this.props.symbol,

      // symbol: this.props.symbol as string,
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any
      // datafeed: new Datafeeds.UDFCompatibleDatafeed(this.props.datafeedUrl),
      datafeed: Datafeed,
      interval: this.props.interval as ChartingLibraryWidgetOptions['interval'],
      container: this.ref.current,
      library_path: this.props.libraryPath as string,

      locale: navigator.language.slice(0, 2) as LanguageCode,
      disabled_features: [
        'use_localstorage_for_settings', // this affects the css of the chart
        // 'header_saveload',
        // 'header_settings',
        // 'study_templates',
        // // 'auto_enable_symbol_labels', // hide symbol labels
        // // 'study_overlay_compare_legend_option',
        // // 'symbol_info',
        // 'header_screenshot',
        // 'header_fullscreen_button',
        // 'create_volume_indicator_by_default',
        isPerpsApp() ? 'header_symbol_search' : '',
        isPerpsApp() ? 'header_compare' : '',
        // 'show_hide_button_in_legend',
      ],
      enabled_features: [
        // 'auto_enable_symbol_labels',
        // 'hide_resolution_in_legend',
        // 'study_overlay_compare_legend_option',
      ],
      theme: this.props.darkMode ? 'Dark' : 'Light',
      client_id: this.props.clientId,
      user_id: this.props.userId,
      fullscreen: this.props.fullscreen,
      toolbar_bg: 'transparent',
      autosize: this.props.autosize,
      studies_overrides: this.props.studiesOverrides,
      overrides: {
        // "mainSeriesProperties.showCountdown": true,
        'paneProperties.background': this.props.darkMode ? 'rgba(13, 12, 19, 1)' : 'rgb(249, 250, 251)',
        // 'scalesProperties.background': this.props.darkMode ? 'rgba(17, 24, 39, 1)' : 'rgba(249, 250, 251, 1)',

        // "paneProperties.vertGridProperties.color": "#363c4e",
        // "paneProperties.horzGridProperties.color": "#363c4e",
        // "symbolWatermarkProperties.transparency": 90,
        // "scalesProperties.textColor" : "#AAA",
        'mainSeriesProperties.candleStyle.wickUpColor': 'gray',
        'mainSeriesProperties.candleStyle.wickDownColor': 'gray',
        'mainSeriesProperties.candleStyle.upColor': 'rgb(51,215,120)',
        'mainSeriesProperties.candleStyle.borderUpColor': 'rgb(51,215,120)',
        'paneProperties.legendProperties.showSeriesTitle': false,
        'scalesProperties.showSymbolLabels': true,
      },
      custom_css_url: '../tvcharts.css',
      compare_symbols: [
        {
          symbol: 'EVIV',
          title: 'Volmex Ethereum Implied Volatility Index',
        },
        {
          symbol: 'BVIV',
          title: 'Volmex Bitcoin Implied Volatility Index',
        },
        {
          symbol: 'EVRV',
          title: 'Volmex Ethereum Realized Volatility Index',
        },
        {
          symbol: 'BVRV',
          title: 'Volmex Bitcoin Realized Volatility Index',
        },
        {
          symbol: 'EVRP',
          title: 'Volmex Ethereum Risk Premium Index',
        },
        {
          symbol: 'BVRP',
          title: 'Volmex Bitcoin Risk Premium Index',
        },
        {
          symbol: 'EVCORR1W',
          title: 'Volmex Ethereum Spot Volatility 1 Week Correlation Index',
        },
        {
          symbol: 'BVCORR1W',
          title: 'Volmex Bitcoin Spot Volatility 1 Week Correlation Index',
        },
      ],
    }
    console.log({darkMode123: this.props.darkMode})
    const tvWidget = new widget(widgetOptions)
    console.log({ tvWidget })
    // set chart type to area
    
    if (this.props.darkMode) {
      tvWidget.applyOverrides({ 'paneProperties.background': 'rgba(13, 12, 19, 1)', 'paneProperties.backgroundType' : 'solid' })
    }
    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        tvWidget.chart().setChartType(this.props.defaultLines ?? 3)
        if (this.props.compareSymbols !== undefined) {
          for (const symbol of this.props.compareSymbols) {
            tvWidget.chart().createStudy('Compare', true, false, ['open', symbol])
          }
          tvWidget.chart().applyOverrides({ 'scalesProperties.showSymbolLabels': true })
        }

        this.tvWidget = tvWidget
      })
    })
  }

  public componentDidMount(): void {
    console.log('darkMode123 mount', this.props.darkMode)
    this.initWidget()
  }
  
  public componentWillUnmount(): void {
    console.log('darkMode123 unmount', this.props.darkMode)
    if (this.tvWidget !== null) {
      this.tvWidget.remove()
      this.tvWidget = null
    }
  }
  
  componentDidUpdate = () => {
    if (this.tvWidget !== null) {
      this.tvWidget.onChartReady(() => {
        const tvWidget = this.tvWidget!
        const themeName = tvWidget.getTheme()
        if (themeName.toLocaleLowerCase() === 'dark' && this.props.darkMode !== true) {
          tvWidget.changeTheme('Light')
        } else if (themeName.toLocaleLowerCase() === 'light' && this.props.darkMode === true) {
          tvWidget.changeTheme('Dark')
        }

        tvWidget.setSymbol(this.props.symbol || 'EVIV', 15, () => {})
        tvWidget.chart().removeAllStudies()
        if (this.props.compareSymbols) {
          for (const symbol of this.props.compareSymbols) {
            tvWidget.chart().createStudy('Compare', true, false, ['open', symbol])
          }
        }
      })
    }
  }

  public render(): JSX.Element {
    return <div className="h-full w-full" ref={this.ref} />
  }
}
