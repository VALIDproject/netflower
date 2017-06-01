/**
* Created by Florian on 12.04.2017.
*/

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import {MAppViews} from './app';
import 'imports-loader?d3=d3!../lib/sankey.js';
import {AppConstants} from './app_constants';

class SankeyDetail implements MAppViews {

  private $node;
  private isOpen = false;
  private detailSVG;

  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent);
  }

  /**
  * Initialize the view and return a promise
  * that is resolved as soon the view is completely initialized.
  * @returns {Promise<SankeyDetail>}
  */
  init() {
    // this.build();
    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
  * Build the basic DOM elements
  */
  // private build() {
  //
  // }

  /**
  * Attach the event listeners
  */
  private attachListener() {
    events.on(AppConstants.EVENT_CLICKED_PATH, (evt, data, json) => {
      if(this.isOpen) {
        this.closeDetail();
        this.isOpen = false;
      } else {
        this.drawDetails(data, json);
        this.isOpen = true;
      }
    });
  }

  /**
   * This method cleans up the view by removing all generated graphs and charts.
   */
  private closeDetail () {
    console.log('remove', this.$node, this.detailSVG);
    this.detailSVG.remove();
    this.$node.select('svg.sankey_details').remove();
  }

  /**
   * This method draws the bar chart over time for each selected node.
   * @param clickedPath is the node which was clicked by the user
   * @param json is the whole data set in order to retrieve all time points for the current node
   */
  private drawDetails (clickedPath, json) {
    let margin = {top: 30 , right: 40, bottom: 30, left: 40},
    w = 400 - margin.left - margin.right,
    h = 200 - margin.top - margin.bottom;

    let sourceName = clickedPath.source.name;
    let targetName = clickedPath.target.name;
    let value = clickedPath.target.value;

    //Tooltip for the bar chart
    let tooltip = this.$node.append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('z-index', '200000');

    const units = '€';
    const formatNumber = d3.format(',.0f'),   // zero decimal places
    format = function(d) { return formatNumber(d) + ' ' + units; };

    this.$node.append('svg')
    .attr('class', 'sankey_details')
    .attr('transform', 'translate(' + 550 + ',' + 300 + ')')
    .attr('width', w + margin.left + margin.right + 'px')
    .attr('height', h + margin.top + margin.bottom + 'px')
    .style('background-color',  '#e0e0e0')
    .style('z-index', '10000')
    .append('text')
    .attr('class', 'caption')
    .text(function(d) { return sourceName + ' → ' + targetName ; })
    .attr('x', 5)
    .attr('y', 16);

    //Filter data based on the clicked path (sourceName and targetName) and store it
    let path = json.filter((obj) => {
      return obj.sourceNode === sourceName && obj.targetNode === targetName;
    });

    //Data for the bar chart
    let valueOverTime = {};
    for(let key in path) {
      if(path.hasOwnProperty(key)) {
        valueOverTime[path[key].timeNode] = path[key];
      }
    }
    let data = [];
    for(let i in valueOverTime) {
      data.push({timeNode: +valueOverTime[i].timeNode, valueNode: +valueOverTime[i].valueNode});
    }

    //X-Scale and equal distribution
    let x = (<any>d3).scale.ordinal()
    .rangeBands([0, w], 0.2);

    //Y-Scale for the chart
    let y = d3.scale.linear()
    .range([h, 0]);

    x.domain(data.map(function(d) { return d.timeNode; }));
    y.domain([0, d3.max(data, function(d) { return d.valueNode; })]);

    //Add the svg for the bars and transform it slightly to be in position of the box
    this.detailSVG = d3.select('svg.sankey_details')
      .append('g')
      .attr('class', 'bars')
      .attr('transform', 'translate(' + (margin.left + 10) + ',' + margin.top + ')');

    //Add in the bar charts and the tooltips if user mouses over them.
    this.detailSVG.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function(d, i) { return x(d.timeNode); })
    .attr('width', x.rangeBand())
    .attr('y', function(d) { return y(d.valueNode); }) // h - y(d.valueNode);
    .attr('height', function(d) { return y(0) - y(d.valueNode); })
    .on('mouseover', function(d) {
      tooltip.transition().duration(200).style('opacity', .9);

      tooltip.html(format(d.valueNode))
      .style('left', ((<any>d3).event.pageX -40) + 'px')
      .style('top', ((<any>d3).event.pageY - 20) + 'px');
    })
    .on('mouseout', function(d) {
      tooltip.transition().duration(500).style('opacity', 0);
    });

    //Define the axes and draw them
    let xAxis = d3.svg.axis().scale(x)
    .orient('bottom');

    let yAxis = d3.svg.axis().scale(y)
    .orient('left');

    this.detailSVG.append('g')
    .attr('class', ' x axis')
    .attr('transform', 'translate(0,' + h + ')')
    .call(xAxis);

    this.detailSVG.append('g')
    .attr('class', 'y axis')
    .call(yAxis.ticks(4).tickFormat(d3.format(',')));
  }
}
/**
* Factory method to create a new SankeyDiagram instance
* @param parent
* @param options
* @returns {SankeyDetail}
*/
export function create(parent: Element, options: any) {
  return new SankeyDetail(parent, options);
}
