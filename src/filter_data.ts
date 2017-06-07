/**
 * Created by cniederer on 21.04.17.
 */
/**
 * Created by Florian on 12.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';
import FilterPipeline from './filters/filterpipeline';
import QuarterFilter from './filters/quarterFilter';
import EuroFilter from './filters/euroFilter';
import TopFilter from './filters/topFilter';

class FilterData implements MAppViews {

  private $node: d3.Selection<any>;
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
      this.attachListener(value);
    });

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build(json) {
    this.$node.html(`
      <div class='container'>
        <div class='row'>
          <div class='col-md-5'>
            <h3>Euro Filter</h3>
          </div>
          <div class='col-md-5'>
            <h3>Quartal Filter</h3>
          </div>
          <div class='col-md-2'>
            <h3>Top Filter</h3>
          </div>
        </div>

        <div class='row'>
          <div class='col-md-2'>
            <label>Min:</label>
            <input type='text' id='euroFilterMin' />
          </div>
          <div class='col-md-2'>
            <label>Max:</label>
            <input type='text' id='euroFilterMax' />
          </div>
          <div class='col-md-2 col-md-offset-1'>
            <label>Min:</label>
            <input type='text' id='quarterFilterMin' />
          </div>
          <div class='col-md-2'>
            <label>Max:</label>
            <input type='text' id='quarterFilterMax' />
          </div>
          <div class='col-md-2 col-md-offset-1'>
            <button type='button' id='topFilter' class='btn btn-primary'>Toggle Top Filter</button>
          </div>
        </div>
    `);

    this.setEuroFilterRange(json);
    this.setQuarterFilterRange(json);
  }

  /**
   * Attach the event listeners
   */
  private attachListener(json) {
    this.$node.select('#euroFilterMin').on('input', (d) => {
      let newMin:number = $('#euroFilterMin').val() as number;
      this.euroFilter.minValue = newMin;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    this.$node.select('#euroFilterMax').on('input', (d) => {
      let newMax:number = $('#euroFilterMax').val() as number;
      this.euroFilter.maxValue = newMax;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    this.$node.select('#quarterFilterMin').on('input', (d) => {
      let newMin:number = $('#quarterFilterMin').val() as number;
      this.quarterFilter.minValue = newMin;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    this.$node.select('#quarterFilterMax').on('input', (d) => {
      let newMax:number = $('#quarterFilterMax').val() as number;
      this.quarterFilter.maxValue = newMax;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    this.$node.select('#topFilter').on('click', (d) => {
      this.topFilter.switchActive();
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });
  }

  private setQuarterFilterRange(json)
  {
    let min:number = json[0].timeNode;
    let max:number = json[0].timeNode;
    for(let entry of json)
    {
      if(entry.timeNode < min)
        min = entry.timeNode;

      if(entry.timeNode > max)
        max = entry.timeNode;
    }

    this.quarterFilter.changeRange(min, min);
    $('#quarterFilterMin').val(min.toString());
    $('#quarterFilterMax').val(min.toString());
  }

   private setEuroFilterRange(json)
  {
    let min:number = Number(json[0].valueNode);
    let max:number = Number(json[0].valueNode);
    for(let entry of json)
    {
      let value:number = Number(entry.valueNode);
      if(value < min)
        min = value;

      if(value > max)
        max = value;
    }

    this.euroFilter.changeRange(min, max);
    $('#euroFilterMin').val(min.toString());
    $('#euroFilterMax').val(max.toString());
  }
}

/**
 * Factory method to create a new SankeyDiagram instance
 * @param parent
 * @param options
 * @returns {SankeyDiagram}
 */
export function create(parent: Element, options: any) {
  return new FilterData(parent, options);
}
