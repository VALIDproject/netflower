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
import * as bootbox from 'bootbox';
import 'ion-rangeslider';
import 'style-loader!css-loader!ion-rangeslider/css/ion.rangeSlider.css';
import 'style-loader!css-loader!ion-rangeslider/css/ion.rangeSlider.skinFlat.css';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';
import FilterPipeline from './filters/filterpipeline';
import QuarterFilter from './filters/quarterFilter';
import TopFilter from './filters/topFilter';
import ParagraphFilter from './filters/paragraphFilter';
import EntityEuroFilter from './filters/entityEuroFilter';
import MediaEuroFilter from './filters/mediaEuroFilter';

class FilterData implements MAppViews {

  private $node: d3.Selection<any>;
  private pipeline: FilterPipeline;
  private quarterFilter: QuarterFilter;
  private topFilter: TopFilter;
  private paragraphFilter: ParagraphFilter;

  constructor(parent: Element, private options: any)
  {
    //Get FilterPipeline
    this.pipeline = FilterPipeline.getInstance();
    //Create Filters
    this.quarterFilter = new QuarterFilter();
    this.topFilter = new TopFilter();
    this.paragraphFilter = new ParagraphFilter();
    //Add Filters to Pipeline
    this.pipeline.changeTopFilter(this.topFilter); //must be first filter
    this.pipeline.addFilter(this.quarterFilter);
    this.pipeline.addAttributeFilter(this.paragraphFilter);

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
      this.build();
      this.attachListener(value);
    });

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build() {
    this.$node.html(`
      <div class='container'>
        <div class='row'>
          <div class='col-sm-2'>
            <small>Top Filter</small>
          </div>
          <div class='col-sm-2'>
            <small>Paragraph Filter</small>
          </div>
        </div>

        <div class='row'>
          <div class='col-sm-2'>
            <select class='form-control input-sm' id='topFilter'>
              <option value='-1' selected>disabled</option>
              <option value='0'>Bottom 10</option>
              <option value='1'>Top 10</option>
            </select>
          </div>
          <div class='col-sm-2'>
            <select class='form-control input-sm' id='paragraph'>
              <option value='-1' selected>disabled</option>
            </select>
          </div>
        </div>
       </div>
       <div class='quarterSlider'>
        <input id='timeSlider'/>
       </div>
    `);
  }

  /**
   * Attach the event listeners
   */
  private attachListener(json) {
    //Set the filters only if data is available
    let dataAvailable = localStorage.getItem('dataLoaded') == 'loaded' ? true : false;
    if(dataAvailable) {
      this.setQuarterFilterRange(json);
      this.setParagraphFilterElements(json);
    }

    events.on(AppConstants.EVENT_FILTER_DEACTIVATE_TOP_FILTER, (evt, data) => {
      this.topFilter.active = false;
      $('#topFilter').val(-1);
    });


    this.$node.select('#topFilter').on('change', (d) => {
      let value:number = $('#topFilter').val() as number;

      if(value == 0)
      {
        this.topFilter.active = true;
        this.topFilter.changeFilterTop(false);
      }
      else if(value == 1)
      {
        this.topFilter.active = true;
        this.topFilter.changeFilterTop(true);
      }
      else {
        this.topFilter.active = false;
      }
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    this.$node.select('#paragraph').on('change', (d) => {
      let value:number = $('#paragraph').val() as number;
      if(value < 0)
      {
        this.paragraphFilter.active = false;
      }

      else {
        this.paragraphFilter.active = true;
        this.paragraphFilter.value = value;
      }
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    events.on(AppConstants.EVENT_UI_COMPLETE, (evt, data) => {
      let max = this.quarterFilter.maxValue;
      this.quarterFilter.changeRange(max, max);
      let filterQuarter = this.quarterFilter.meetCriteria(data);
      events.fire(AppConstants.EVENT_SLIDER_CHANGE, filterQuarter);
    });
  }

  /**
   * This method adds all the elements and options for the paragraph filter.
   * @param json with the data to be added.
   */
  private setParagraphFilterElements(json)
  {
    let paragraphs:Array<number> = [];

    for(let entry of json)
    {
      let val:number = entry.attribute1;
      if(paragraphs.indexOf(val) === -1)
      {
        paragraphs.push(val);
        this.$node.select('#paragraph').append('option').attr('value',val).text(val);
      }
    }
  }

  /**
   * This method adds the slider for the time range.
   * @param json with the data to be added.
   */
  private setQuarterFilterRange(json)
  {
    let min: number = json[0].timeNode;
    let max: number = json[0].timeNode;
    for(let entry of json)
    {
      if(entry.timeNode < min)
        min = entry.timeNode;

      if(entry.timeNode > max)
        max = entry.timeNode;
    }
    this.quarterFilter.changeRange(min, max);

    $('#timeSlider').ionRangeSlider({
      type: 'double',
      min: min,
      max: max,
      from: max,
      to: max,
      prefix: 'Q',
      force_edges: true,  //Lets the labels inside the container
      drag_interval: true, //Allows the interval to be dragged around
      onFinish: (sliderData) => {
        let newMin: number = sliderData.from;
        let newMax: number = sliderData.to;
        this.quarterFilter.minValue = newMin;
        this.quarterFilter.maxValue = newMax;
        events.fire(AppConstants.EVENT_FILTER_CHANGED, json);

        //This notifies the sliders to change their values but only if the quarter slider changes
        let filterQuarter = this.quarterFilter.meetCriteria(json);
        events.fire(AppConstants.EVENT_SLIDER_CHANGE, filterQuarter);
      }
    });
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
