/**
 * Created by cniederer on 21.04.17.
 */
/**
 * Created by Florian on 12.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';
import FilterPipeline from './filterpipeline';
import QuarterFilter from './filters/quarterFilter';
import EuroFilter from './filters/euroFilter';
import TopFilter from './filters/topFilter';

class Filter implements MAppViews {

  private $node;
  private pipeline: FilterPipeline;
  private quarterFilter: QuarterFilter;
  private euroFilter: EuroFilter;
  private topFilter: TopFilter;

  constructor(parent: Element, private options: any)
  {
    //Create FilterPipeline
    this.pipeline = FilterPipeline.getInstance();
    //Create Filters
    this.euroFilter = new EuroFilter();
    this.quarterFilter = new QuarterFilter();
    this.topFilter = new TopFilter();
    //Add Filters to Pipeline
    this.pipeline.addFilter(this.topFilter);
    this.pipeline.addFilter(this.quarterFilter);
    this.pipeline.addFilter(this.euroFilter);

    this.$node = d3.select(parent)
      .append('div')
      .classed('filter', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<SankeyDiagram>}
   */
  init() {
    localforage.getItem('data').then((value) => {
      this.build(value);
    });
    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build(json) {
    this.$node.html(`
      <div class="container">
        <div class="row">
          <div class="col-md-5">
            <h3>Euro Filter</h3>
          </div>
          <div class="col-md-5">
            <h3>Quartal Filter</h3>
          </div>
          <div class="col-md-2">
            <h3>Top Filter</h3>
          </div>
        </div>

        <div class="row">
          <div class="col-md-2">
            <label>Min:</label>
            <input type="text" id="euroFilterMin" />
          </div>
          <div class="col-md-2">
            <label>Max:</label>
            <input type="text" id="euroFilterMax" />
          </div>
          <div class="col-md-2 col-md-offset-1">
            <label>Min:</label>
            <input type="text" id="quarterFilterMin" />
          </div>
          <div class="col-md-2">
            <label>Max:</label>
            <input type="text" id="quarterFilterMax" />
          </div>
          <div class="col-md-2 col-md-offset-1">
            <button type="button" id="topFilter" class="btn btn-primary">Toggle Top Filter</button>
          </div>
        </div>
    `);

    this.$node.select('#euroFilterMin').on('input', (d) => {
      let newMin:number = Number((<HTMLInputElement>document.getElementById("euroFilterMin")).value);
      this.euroFilter.minValue = newMin;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    this.$node.select('#euroFilterMax').on('input', (d) => {
      let newMax:number = Number((<HTMLInputElement>document.getElementById("euroFilterMax")).value);
      this.euroFilter.maxValue = newMax;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    this.$node.select('#quarterFilterMin').on('input', (d) => {
      let newMin:number = Number((<HTMLInputElement>document.getElementById("quarterFilterMin")).value);
      this.quarterFilter.minValue = newMin;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    this.$node.select('#quarterFilterMax').on('input', (d) => {
      let newMax:number = Number((<HTMLInputElement>document.getElementById("quarterFilterMax")).value);
      this.quarterFilter.maxValue = newMax;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    this.$node.select('#topFilter').on('click', (d) => {
      this.topFilter.switchActive();
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });


    this.setEuroFilterRange(json);
    this.setQuarterFilterRange(json);
  }

  private setEuroFilterRange(json)
  {
    let min:number = Number(json[0].euro);
    let max:number = Number(json[0].euro);
    for(let entry of json)
    {
      let value:number = Number(entry.euro);
      if(value < min)
        min = value;

      if(value > max)
        max = value;
    }

    this.euroFilter.changeRange(min, max);
    (<HTMLInputElement>document.getElementById("euroFilterMin")).value = min.toString();
    (<HTMLInputElement>document.getElementById("euroFilterMax")).value = max.toString();
  }

  private setQuarterFilterRange(json)
  {
    let min:number = json[0].quartal;
    let max:number = json[0].quartal;
    for(let entry of json)
    {
      if(entry.quartal < min)
        min = entry.quarter;

      if(entry.quartal > max)
        max = entry.quartal;
    }

    this.quarterFilter.changeRange(min, max);
    (<HTMLInputElement>document.getElementById("quarterFilterMin")).value = min.toString();
    (<HTMLInputElement>document.getElementById("quarterFilterMax")).value = max.toString();
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
  }

}

/**
 * Factory method to create a new SankeyDiagram instance
 * @param parent
 * @param options
 * @returns {SankeyDiagram}
 */
export function create(parent: Element, options: any) {
  return new Filter(parent, options);
}
