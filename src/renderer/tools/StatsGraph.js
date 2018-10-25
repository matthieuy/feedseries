import jQuery from 'jquery'
import moment from 'moment'
let CanvasJS = require('canvasjs')

class StatsGraph {
  /**
   * Constructor
   */
  constructor () {
    this._graphs = {}
    this._labelFormat = {}
    this._data = {}
    this._selectedGraph = null
  }

  /**
   * Select a graph
   * @param {String} name Graphname
   * @return {StatsGraph}
   */
  selectGraph (name) {
    this._selectedGraph = name
    return this
  }

  /**
   * Set label format
   * @param {String} format Moment format
   * @param {String?} graphName Graphname or null for current graph
   * @return {StatsGraph}
   */
  setLabelFormat (format, graphName) {
    if (!graphName) {
      graphName = this._selectedGraph
    }
    this._labelFormat[graphName] = format
    return this
  }

  /**
   * Add a graph
   * @param {String} name The uniq name
   * @param {String} el CSS ID
   * @param {String} title Title
   * @param {Object?} opts Options
   * @return {StatsGraph}
   */
  addGraph (name, el, title, opts) {
    this.selectGraph(name)
    this.setLabelFormat('ddd DD')
    this._data[name] = []

    let optionsDefault = {
      animationEnabled: true,
      backgroundColor: '#181A1F',
      height: 300,
      title: {
        text: title,
      },
      axisX: {
        margin: 0,
      },
      axisY: {
        includeZero: false,
        scaleBreaks: {
          autoCalculate: true,
        },
      },
      toolTip: {
        shared: 'true',
        backgroundColor: '#21252B',
        fontColor: '#FFF',
        borderColor: '#181A1F',
      },
      legend: {
        fontColor: '#FFF',
        fontSize: 14,
        itemclick: (e) => {
          e.dataSeries.visible = !(typeof e.dataSeries.visible === 'undefined' || e.dataSeries.visible)
          this.render(name)
        },
      },
      data: this._data[name],
    }

    let options = (typeof opts !== 'undefined') ? jQuery.extend(true, {}, optionsDefault, opts) : optionsDefault
    this._graphs[this._selectedGraph] = new CanvasJS.Chart(el, options)

    return this
  }

  /**
   * Add a serie to graph
   * @param {String} name Serie name
   * @param {String} statType stat.type
   * @param {Object?} opts Options
   * @return {StatsGraph}
   */
  addSerie (name, statType, opts) {
    let optionsDefault = {
      type: 'spline',
      name: name,
      connectNullData: true,
      nullDataLineDashType: 'dot',
      showInLegend: true,
      dataPoints: [],
      statType: statType,
    }

    let options = (typeof opts !== 'undefined') ? jQuery.extend(true, {}, optionsDefault, opts) : optionsDefault
    this._data[this._selectedGraph].push(options)

    return this
  }

  /**
   * Set stats
   * @param {Stats[]} stats
   * @return {StatsGraph}
   */
  setStats (stats) {
    for (let name in this._data) {
      if (this._data.hasOwnProperty(name)) {
        // Reset datapoints
        for (let i = 0; i < this._data[name].length; i++) {
          this._data[name][i].dataPoints = []
        }

        stats.forEach((stat) => {
          let indexData = this._data[name].findIndex((a) => a.statType === stat.type)
          if (indexData !== -1) {
            let label = moment(stat.date).format(this._labelFormat[name])
            let findData = this._data[name][indexData].dataPoints.findIndex((a) => a.label === label)

            // Add or update datapoint
            if (findData === -1) {
              this._data[name][indexData].dataPoints.push({
                label: label,
                y: stat.value,
                date: stat.date,
              })
            } else {
              this._data[name][indexData].dataPoints[findData].y += stat.value
            }
          }
        })

        // if (name === 'shows') {
        //   for (let i = 0; i < this._data[name].length; i++) {
        //     let date = moment(this._data[name][i].dataPoints[0].date).startOf('day')
        //     do {
        //       let label = date.format(this._labelFormat[name])
        //       let index = this._data[name][i].dataPoints.findIndex((a) => a.label === label)
        //       if (index === -1) {
        //         this._data[name][i].dataPoints.push({
        //           label: label,
        //           y: 0,
        //           date: date.toDate(),
        //         })
        //       }
        //       date = date.add(1, 'days')
        //     } while (date.isBefore(moment.now()))
        //     this._data[name][i].dataPoints = this._data[name][i].dataPoints.sort((a, b) => a.date - b.date)
        //     console.log(this._data[name][i].dataPoints)
        //   }
        // }

        this.render(name)
      }
    }

    return this
  }

  /**
   * Render graph(s)
   * @param {String?} graphName Graphname or null for all
   * @return {StatsGraph}
   */
  render (graphName) {
    let graphListName = (graphName && this._graphs.hasOwnProperty(graphName)) ? [graphName] : Object.keys(this._graphs)

    graphListName.forEach((name) => {
      this._graphs[name].options.data = this._data[name].filter((a) => a.dataPoints.length)
      this._graphs[name].render()
    })

    return this
  }
}

export default StatsGraph
