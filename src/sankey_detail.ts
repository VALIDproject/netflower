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
      this.openDetails(data, json);
    });


  }

  private openDetails (clickedPath, json) {

    let w = 600;
    let h = 200;
    //console.log('openDetails - true', clickedPath);
    let details = this.$node;
    details.attr('transform', 'translate(' + 600 + ',' + 500 + ')')
    .attr('width', w + 'px')
    .attr('height', h + 'px')
    .style('background',  '#C0C0C0')
    .style('z-index', '10000');

    let sourceName = clickedPath.source.name;
    let targetName = clickedPath.target.name;
    let value = clickedPath.target.value;

    let euroOverTime = (<any>d3).nest()
    .key(function (d) {return d.quartal; })
    //.key(function (d) {return d.rechtstraeger; })
    .entries(json);


    let data = [];
    //2015 
    for(let i in euroOverTime[0].values) {

      if(euroOverTime[0].values[i].rechtstraeger === sourceName && euroOverTime[0].values[i].mediumMedieninhaber === targetName) {

        data.push(
          [+euroOverTime[0].values[i].quartal,+euroOverTime[0].values[i].euro ],
          [+euroOverTime[1].values[i].quartal, +euroOverTime[1].values[i].euro],
          [+euroOverTime[2].values[i].quartal, +euroOverTime[2].values[i].euro],
          [+euroOverTime[3].values[i].quartal, +euroOverTime[3].values[i].euro]
        );
      }
    }

    var x = (<any>d3).scale.ordinal()
    .rangeBands([0, w], 0.2);

    var y = d3.scale.linear()
    .range([h, 0]);

    x.domain(data.map(function(d) { return d; }));
    y.domain([0, d3.max(data[1])]);

    let detailSVG = d3.select('svg.sankey_details');

    detailSVG.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function(d, i) { console.log('i', i);return x(d); })
    .attr('width', x.rangeBand())
    .attr('y', function(d) { console.log('data - y', d); return y(d[1]); })
    .attr('height', function(d) { return 200 - y(d[1]); });

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
