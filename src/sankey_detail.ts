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
      console.log('data', data, 'json', json);
      this.openDetails(data, json);
    });


  }

  private openDetails (clickedPath, json) {
    //console.log('openDetails - true', clickedPath);
    let details = this.$node;
    details.attr('transform', 'translate(' + 600 + ',' + 500 + ')')
    .attr('width', 600 + 'px')
    .attr('height', 200 + 'px')
    .style('background',  '#C0C0C0')
    .style('z-index', '10000');

    console.log(json);

    let euroOverTime = (<any>d3).nest()
    .key(function (d) {return d.quartal; })
    .key(function (d) {return d.rechtstraeger; })
    .rollup(function (v) {
      //console.log('v', v);
      let sum = (<any>d3).sum(v, function (d){ return d.euro});
      //console.log('sum', sum);
      return [sum]})
      .map(json);

      console.log(euroOverTime, 'length', Object.keys(euroOverTime).length);

      // for(var i = 0; i <= Object.keys(euroOverTime).length; i++) {
      //
      //   console.log(i, euroOverTime[i]);
      //
      // }

      for (let key in euroOverTime) {
        if (euroOverTime.hasOwnProperty(key)) {

          if(key === '20151') {
          console.log(key + " -> " + euroOverTime[key]);

          }

          //console.log(key + " -> " + euroOverTime[key]);
        }
      }




      // let sumQuartal = (<any>d3).nest()
      // .key(function (d) {return d.quartal; })
      // // .rollup(function (v) {
      // //   //console.log('v', v);
      // //   let sum = (<any>d3).sum(v, function (d){ return d.euro});
      // //  //console.log('sum', sum);
      // //   return sum; })
      // .map(euroOverTime);
      //
      // console.log('Sum over Quartal', sumQuartal);

      // details.selectAll(".bar")
      //     .data(json)
      //   .enter().append("rect")
      //     .attr("class", "bar")
      //     .attr("x", function(d) { return x(d.salesperson); })
      //     .attr("width", x.bandwidth())
      //     .attr("y", function(d) { return y(d.sales); })
      //     .attr("height", function(d) { return height - y(d.sales); });


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
