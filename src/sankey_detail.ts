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


  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
    .append('svg')
    .attr('class', 'sankey_details');
  }



  /**
  * Initialize the view and return a promise
  * that is resolved as soon the view is completely initialized.
  * @returns {Promise<SankeyDetail>}
  */
  init() {
    this.build();
    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
  * Build the basic DOM elements
  */
  private build() {

  }

  /**
  * Attach the event listeners
  */
  private attachListener() {
    events.on(AppConstants.EVENT_CLICKED_PATH, (evt, data, json) => {
      //console.log('data', data, 'json', json);
      console.log(evt);
      this.openDetails(data, json);
    });


  }

  private openDetails (clickedPath, json) {

    let margin = {top: 30 , right: 40, bottom: 30, left: 40},
    w = 400 - margin.left - margin.right,
    h= 200 - margin.top - margin.bottom;




    //console.log('openDetails - true', clickedPath);
    let details = this.$node;
    details.attr('transform', 'translate(' + 400 + ',' + 500 + ')')
    .attr('width', w + margin.left + margin.right + 'px')
    .attr('height', h + margin.top + margin.bottom + 'px')
    .style('background',  '#C0C0C0')
    .style('z-index', '10000');

    let sourceName = clickedPath.source.name;
    let targetName = clickedPath.target.name;
    let value = clickedPath.target.value;

    //console.log('json', json);

    function filterBySelectedPath (obj) {
      return obj.rechtstraeger === sourceName && obj.mediumMedieninhaber === targetName;
    }

    let path = json.filter(filterBySelectedPath);

    //console.log('path', path);

    let euroOverTime = {};

    for(var key in path) {
      if(path.hasOwnProperty(key)) {
        euroOverTime[path[key].quartal] = path[key];
      }
    }

    //console.log('euroOverTime', euroOverTime);

    let data = [];

    for(let i in euroOverTime) {
      data.push({quartal: +euroOverTime[i].quartal, euro: +euroOverTime[i].euro});
    }

    //console.log('data', data);

    var x = (<any>d3).scale.ordinal()
    .rangeBands([0, w ], 0.2);

    var y = d3.scale.linear()
    .range([h, 0]);


    x.domain(data.map(function(d) { return d.quartal; }));
    y.domain([0, d3.max(data, function(d) { return d.euro; })]);

    let detailSVG = d3.select('svg.sankey_details').append('g').attr('class', 'bars');

    detailSVG.attr('transform', 'translate(' + (margin.left + 10) + ',' + margin.top + ')');

    detailSVG.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function(d, i) { return x(d.quartal); })
    .attr('width', x.rangeBand())
    .attr('y', function(d) { return h - y(d.euro); })
    .attr('height', function(d) { return y(d.euro); });
    //  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
    .orient("bottom");

    var yAxis = d3.svg.axis().scale(y)
    .orient("left");

    detailSVG.append('g')
    .attr('class', ' x axis')
    .attr('transform', 'translate(0,' + h + ')')
    .call(xAxis);

    detailSVG.append('g')
    .attr('class', 'y axis')
    .call(yAxis);


    detailSVG.selectAll('text')
    .append('text')
    .attr("transform", "rotate(90)")
    .attr("y", 0)
    .attr("x", 7)
    .attr("dy", ".35em")
    .style("text-anchor", "start");
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
