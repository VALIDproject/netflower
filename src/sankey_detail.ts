/**
* Created by Florian on 12.04.2017.
*/

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import 'imports-loader?d3=d3!../lib/sankey.js';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';
import {dotFormat} from './utilities';
import TimeFormat from './timeFormat';

class SankeyDetail implements MAppViews {

  private $node: d3.Selection<any>;
  private detailSVG: d3.Selection<any>;
  //Check if path was clicked already twice
  private clicked: number = 0;
  //Draw SVG Bar Chart
  private drawSvg: number = 0;
  //Look if the bar chart is drawn
  private drawBarChart: number = 0;
  private toolbox;
  private toolbox2;

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
      if (this.clicked <= 1 ) {
        this.drawDetails(data, json);
        ++this.clicked;
      } else {
        this.closeDetail();
        this.clicked = 0;
      }
    });

    events.on(AppConstants.EVENT_CLOSE_DETAIL_SANKEY, (evt, d) => {
      this.closeDetail();
      this.clicked = 0;
    });
  }

  /**
  * This method cleans up the view by removing all generated graphs and charts.
  */
  private closeDetail () {
    this.$node.select('svg.sankey_details').remove();
    this.$node.select('svg.sankey_details2').remove();
  }

  /**
  * This method draws the bar chart over time for each selected node.
  * @param clickedPath is the node which was clicked by the user
  * @param json is the whole data set in order to retrieve all time points for the current node
  */
  private drawDetails (clickedPath, json) {
    const margin = {top: 30 , right: 40, bottom: 30, left: 40},
    w = 400 - margin.left - margin.right,
    h = 200 - margin.top - margin.bottom;

    const sourceName = clickedPath.source.name;
    const targetName = clickedPath.target.name;
    const value = clickedPath.target.value;

    //Tooltip for the bar chart
    const tooltip = this.$node.append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('z-index', '200000');

    //get width and height of sankey div to calculate position of svg
    const widthSankeyDiv = (<any>d3).select('.sankey_vis').node().getBoundingClientRect().width;
    const heightSankeyDiv = (<any>d3).select('.sankey_vis').node().getBoundingClientRect().height;

    //position of svg in the sankey_diagram div
    const xpositionSvg = widthSankeyDiv / 2 + 100;
    const ypositionSvg = heightSankeyDiv / 2 - h;
    const newYPositionSvg = ypositionSvg + 20;


    if (this.drawSvg === 0) {
      this.$node.append('svg')
      .attr('class', 'sankey_details')
      .attr('transform', 'translate(' + xpositionSvg + ',' + newYPositionSvg + ')')
      .attr('width', w + margin.left + margin.right + 'px')
      .attr('height', h + margin.top + margin.bottom + 'px')
      .style('background-color',  '#e0e0e0')
      .style('z-index', '10000')
      .append('text')
      .text(function(d) { return sourceName + ' → ' + targetName +  '  ' + dotFormat(value) ; })
      .attr('x', 5)
      .attr('y', 16);

      this.toolbox = d3.select('svg.sankey_details')
      .append('g')
      .attr('class', 'toolbox')
      .attr('transform', 'translate(' + 20 + ',' + 30 + ')');

      this.toolbox.append('text')
      .attr('font-family', 'FontAwesome')
      .text(function(d) { return ' ' + '\uf24a';})
      .style('z-index', '200000')
      .attr('x', '354')
      .attr('y', '10')
      .attr('class', 'addNotes')
      .on('mouseover', function(d) {
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html('Add Notes to this particular flow!')
        .style('left', ((<any>d3).event.pageX -40) + 'px')
        .style('top', ((<any>d3).event.pageY - 20) + 'px');
      })
      .on('mouseout', function(d) {
        tooltip.transition().duration(500).style('opacity', 0);
      })
      .on('click', function(d){
        alert('Save NOTES in a feature version!!');
      });

      ++this.drawSvg;

    } else {
      this.$node.append('svg')
      .attr('class', 'sankey_details2')
      .attr('transform', 'translate(' + xpositionSvg + ',' + (newYPositionSvg + 20) + ')')
      .attr('width', w + margin.left + margin.right + 'px')
      .attr('height', h + margin.top + margin.bottom + 'px')
      .style('background-color',  '#e0e0e0')
      .style('z-index', '10000')
      .append('text')
      .attr('class', 'caption')
      .text(function(d) { return sourceName + ' → ' + targetName + '  ' + dotFormat(value); })
      .attr('x', 5)
      .attr('y', 16);

      this.toolbox2 = d3.select('svg.sankey_details2')
      .append('g')
      .attr('class', 'toolbox2')
      .attr('transform', 'translate(' + 20 + ',' + 30 + ')');

      this.toolbox2.append('text')
      .attr('font-family', 'FontAwesome')
      .text(function(d) { return ' ' + '\uf24a';})
      .style('z-index', '200000')
      .attr('x', '354')
      .attr('y', '10')
      .attr('class', 'addNotes')
      .on('mouseover', function(d) {
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html('Add Notes to this particular flow!')
        .style('left', ((<any>d3).event.pageX -40) + 'px')
        .style('top', ((<any>d3).event.pageY - 20) + 'px');
      })
      .on('mouseout', function(d) {
        tooltip.transition().duration(500).style('opacity', 0);
      })
      .on('click', function(d){
        alert('Save NOTES in a feature version!!');
      });
      this.drawSvg = 0;
    }

    //Filter data based on the clicked path (sourceName and targetName) and store it
    const path = json.filter((obj) => {
      return obj.sourceNode === sourceName && obj.targetNode === targetName;
    });

    //Data for the bar chart
    const valueOverTime = {};
    for(const key in path) {
      if(path.hasOwnProperty(key)) {
        valueOverTime[path[key].timeNode] = path[key];
      }
    }
    const data = [];
    for(const i in valueOverTime) {
      if(valueOverTime.hasOwnProperty(i)) {
        data.push({timeNode: +valueOverTime[i].timeNode, valueNode: +valueOverTime[i].valueNode});
      }
    }

    //X-Scale and equal distribution
    const x = (<any>d3).scale.ordinal()
    .rangeBands([0, w], 0.2);

    //Y-Scale for the chart
    const y = d3.scale.linear()
    .range([h, 0]);

    const timePoints = d3.set(
      json.map(function (d: any) { return d.timeNode; })
    ).values().sort();

    x.domain(timePoints);
    y.domain([0, d3.max(data, function(d) { return d.valueNode; })]);

    if (this.drawBarChart === 0) {
      //Add the svg for the bars and transform it slightly to be in position of the box
      this.detailSVG = d3.select('svg.sankey_details')
      .append('g')
      .attr('class', 'bars')
      .attr('transform', 'translate(' + (margin.left + 10) + ',' + margin.top + ')');
      ++this.drawBarChart;

    } else {
      //Add the svg for the bars and transform it slightly to be in position of the box
      this.detailSVG = d3.select('svg.sankey_details2')
      .append('g')
      .attr('class', 'bars')
      .attr('transform', 'translate(' + (margin.left + 10) + ',' + margin.top + ')');
      this.drawBarChart = 0;
    }

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
      tooltip.html(dotFormat(d.valueNode))
      .style('left', ((<any>d3).event.pageX -40) + 'px')
      .style('top', ((<any>d3).event.pageY - 20) + 'px');
    })
    .on('mouseout', function(d) {
      tooltip.transition().duration(500).style('opacity', 0);
    });

    //Define the axes and draw them
    const xAxis = d3.svg.axis().scale(x)
    .tickFormat(TimeFormat.format)
    .orient('bottom');

    const yAxis = d3.svg.axis().scale(y)
    .orient('left');

    this.detailSVG.append('g')
    .attr('class', ' x axis')
    .attr('transform', 'translate(0,' + h + ')')
    .call(xAxis);

    this.detailSVG.append('g')
    .attr('class', 'y axis')
    .call(yAxis.ticks(4).tickFormat(d3.format(',')));

    //Append the close button or link to the SVG
    const close = this.detailSVG.append('g').attr('class', 'closeLink');
    close.append('text')
    .attr('font-family', 'FontAwesome')
    .text(function(d) { return ' ' + '\uf00d';})
    .style('z-index', '200000')
    .attr('x', '325')
    .attr('y', '-13')
    .on('click', function (d) {
      events.fire(AppConstants.EVENT_CLOSE_DETAIL_SANKEY, d);
    });
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
