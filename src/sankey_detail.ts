/**
* Created by Florian on 12.04.2017.
*/

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import 'imports-loader?d3=d3!../lib/sankey.js';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';
import {dotFormat, d3TextEllipse} from './utilities';
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
    events.on(AppConstants.EVENT_CLICKED_PATH, (evt, data, json, coordinates) => {
      //console.log('Coordinaten, mouseclick evenet', coordinates, coordinates[0], coordinates[0]);
      if (this.clicked <= 1 ) {
        this.drawDetails(data, json, coordinates);
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
  private drawDetails (clickedPath, json, coordinates) {
    let margin = {top: 50 , right: 60, bottom: 60, left: 60},
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

    //get width and height of sankey div to calculate position of svg
    let widthSankeyDiv = (<any>d3).select('.sankey_vis').node().getBoundingClientRect().width;
    let heightSankeyDiv = (<any>d3).select('.sankey_vis').node().getBoundingClientRect().height;

    //console.log('sankey_vis area', widthSankeyDiv, heightSankeyDiv);

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    //console.log('window width and height', 'width', windowWidth, 'height',  windowHeight);



    //position of svg in the sankey_diagram div
    //let xpositionSvg = widthSankeyDiv / 2 + 100;
    let xpositionSvg = windowWidth / 2 - (w/2);
    let ypositionSvg = coordinates[1] + h;
    console.log('yposition', ypositionSvg);
    let newYPositionSvg = ypositionSvg + 10;




    if (this.drawSvg === 0) {

      this.$node.append('svg')
      .attr('class', 'sankey_details')
      .attr('transform', 'translate(' + xpositionSvg + ',' + newYPositionSvg + ')')
      .attr('width', w + margin.left + margin.right + 'px')
      .attr('height', h + margin.top + margin.bottom + 'px')
      .style('background-color',  '#e0e0e0')
      .style('z-index', '10000');

      this.$node.select('svg.sankey_details').append('g')
      .attr('class', 'headingDetailSankey')
      .style('z-index', '10001');


      this.$node.select('svg.sankey_details').select('g.headingDetailSankey')
      .append('text')
      .attr('x', 5)
      .attr('y', 16)
      .attr('class', 'source')
      .style('font-size', 11 + 'px')
      .text(function(d) {
        return sourceName;
        //return sourceName;
      });

        this.$node.select('svg.sankey_details').select('g.headingDetailSankey')
        .append('text')
        .attr('class', 'target')
        .html('<br/>' + ' → ' + targetName)
        .attr('x', 5)
        .attr('y', 30)
        .style('font-size', 11 + 'px');

        this.$node.select('svg.sankey_details').select('g.headingDetailSankey')
        .append('text')
        .attr('class', 'target')
        .html('<br/>' + '    ' +  dotFormat(value))
        .attr('x', 200)
        .attr('y', 30 )
        .style('font-size', 11 + 'px');


      const maxTextWidth = (w + margin.left + margin.right - 50)/ 2;
      const leftWrap = this.$node.select('.sankey_details').select('.headingDetailSankey').selectAll('text.source');
      const target = this.$node.select('.sankey_details').select('.headingDetailSankey').selectAll('text.target');
      //console.log('selection- true', leftWrap);

      d3TextEllipse(leftWrap, maxTextWidth);
      d3TextEllipse(target, maxTextWidth);

      this.toolbox = d3.select('svg.sankey_details')
      .append('g')
      .attr('class', 'toolbox')
      .attr('transform', 'translate(' + 5 + ',' + 12 + ')');

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
      .style('font-size', 11 + 'px')
      .attr('class', 'caption')
      .text(function(d) { return sourceName + ' → ' + targetName + '  ' + dotFormat(value); })
      .attr('x', 5)
      .attr('y', 16);


      this.toolbox2 = d3.select('svg.sankey_details2')
      .append('g')
      .attr('class', 'toolbox2')
      .attr('transform', 'translate(' + 5 + ',' + 12 + ')');

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

    let timePoints = d3.set(
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
    let xAxis = d3.svg.axis().scale(x)
    .tickFormat(TimeFormat.format)
    .orient('bottom');

    let yAxis = d3.svg.axis().scale(y)
    .orient('left');



    let xAxisElement = this.detailSVG.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + h + ')')
    .call(xAxis);

    console.log(xAxisElement.selectAll('.tick').selectAll('text'));

    xAxisElement.selectAll('.tick').selectAll('text')
      .attr('y', 0)
      .attr('x', 9)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(90)')
      .style('text-anchor', 'start')
      .style('font-size', 9 + 'px');
    // .attr("x", 7)
    // .attr("y", 0)
    // .attr("dy", ".35em")
    // .style("text-anchor", "start");

    this.detailSVG.append('g')
    .attr('class', 'y axis')
    .call(yAxis.ticks(4).tickFormat(d3.format(',')));

    //Append the close button or link to the SVG
    let close = this.detailSVG.append('g').attr('class', 'closeLink');
    close.append('text')
    .attr('font-family', 'FontAwesome')
    .text(function(d) { return ' ' + '\uf00d';})
    .style('z-index', '200000')
    .attr('font-size', 14 + 'px')
    .attr('x', '310')
    .attr('y', '-28')
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
