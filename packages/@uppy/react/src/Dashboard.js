const React = require('react')
const DashboardPlugin = require('@uppy/dashboard')
const basePropTypes = require('./propTypes').dashboard
const getHTMLProps = require('./getHTMLProps')
const nonHtmlPropsHaveChanged = require('./nonHtmlPropsHaveChanged')

const h = React.createElement

/**
 * React Component that renders a Dashboard for an Uppy instance. This component
 * renders the Dashboard inline, so you can put it anywhere you want.
 */

class Dashboard extends React.Component {
  componentDidMount () {
    this.installPlugin()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.uppy !== this.props.uppy) {
      this.uninstallPlugin(prevProps)
      this.installPlugin()
    } else if (nonHtmlPropsHaveChanged(this, prevProps)) {
      const options = { ...this.props, target: this.container }
      delete options.uppy
      this.plugin.setOptions(options)
    }
  }

  componentWillUnmount () {
    this.uninstallPlugin()
  }

  installPlugin () {
    const { uppy } = this.props
    const options = {
      id: 'react:Dashboard',
      ...this.props,
      target: this.container,
    }
    delete options.uppy
    uppy.use(DashboardPlugin, options)

    this.plugin = uppy.getPlugin(options.id)
  }

  uninstallPlugin (props = this.props) {
    const { uppy } = props

    uppy.removePlugin(this.plugin)
  }

  render () {
    // TODO: stop exposing `validProps` as a public property and rename it to `htmlProps`
    this.validProps = getHTMLProps(this.props)
    return h('div', {
      className: 'uppy-Container',
      ref: (container) => {
        this.container = container
      },
      ...this.validProps,
    })
  }
}

Dashboard.propTypes = basePropTypes

Dashboard.defaultProps = {
  inline: true,
}

module.exports = Dashboard
