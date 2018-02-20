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
import 'jqueryui';
import 'ion-rangeslider';
import 'style-loader!css-loader!ion-rangeslider/css/ion.rangeSlider.css';
import 'style-loader!css-loader!ion-rangeslider/css/ion.rangeSlider.skinNice.css';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';
import {splitAt} from './utilities';
import FilterPipeline from './filters/filterpipeline';
import QuarterFilter from './filters/quarterFilter';
import TopFilter from './filters/topFilter';
import ParagraphFilter from './filters/paragraphFilter';
import EntityEuroFilter from './filters/entityEuroFilter';
import MediaEuroFilter from './filters/mediaEuroFilter';
import TimeFormat from './timeFormat';
import SimpleLogging from './simpleLogging';
import {type} from 'os';
import {TIME_INFO, ATTR_INFO} from './language';

class FilterData implements MAppViews {

  private $node: d3.Selection<any>;
  private pipeline: FilterPipeline;
  private quarterFilter: QuarterFilter;
  private topFilter: TopFilter;
  private paragraphFilter: ParagraphFilter;
  private quarterFilterRef;

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

    // Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build() {
    this.$node.html(`
      <div id='timeForm' class='form-content popup'>
       <h2>Time Range Selection:</h2>
       <p>${TIME_INFO}</p>
       <br/>
         <div class='form-group' style='display: flex;'>
            <ul class='list-group list-inline' id='selectable'></ul>
            <p id='informationTextTimeSelection'>1) Click & Drag mouse for rectangle selection.<br/>
            2) Click one elment to make a single selection.<br/>
            3) CTRL + Click to make a multi selection.</p>
         </div>
         <div class='form-group'>
           <button id='btnSelectAll' class='btn btn-xs btn-info'>Select All</button>
           <button id='btnUnSelectAll' class='btn btn-xs btn-info'>Unselect All</button>
           <button id='btnSelectedTime' class='btn btn-default btn_design pull-right'>Submit</button>
           <br/>
           <hr/>
           <span class='resultarea'><strong>Current Time selected:</strong></span>
           <span id='result' class='resultarea'></span>
         </div>
         <div id='timeClose' class='close'><i class='fa fa-times-circle'></i></div>
       </div>
       
       <div id='attributeForm' class='form-content popup'>
        <h2>Connection Filter:</h2>
        <p>${ATTR_INFO}</p>
        <br/>
        <hr/>
          <div id='paragraph' class='form-check form-check-inline'></div>
          <div id='attributeClose' class='close'><i class='fa fa-times-circle'></i></div>
       </div>
    `);
  }

  /**
   * Attach the event listeners
   */
  private attachListener(json) {
    // Set the filters only if data is available
    const dataAvailable = localStorage.getItem('dataLoaded') === 'loaded' ? true : false;
    if(dataAvailable) {
      this.setQuarterFilterRange(json);
      this.initializeQuarterFilter(json);
      this.setParagraphFilterElements(json);
    }

    events.on(AppConstants.EVENT_FILTER_DEACTIVATE_TOP_FILTER, (evt, data) => {
      this.topFilter.active = false;
      $('#topFilter').val(-1);
    });

    events.on(AppConstants.EVENT_UI_COMPLETE, (evt, data) => {
      const filterQuarter = this.quarterFilter.meetCriteria(data);
      const paraFilterData = this.paragraphFilter.meetCriteria(filterQuarter);
      events.fire(AppConstants.EVENT_SLIDER_CHANGE, paraFilterData);
      // const filterQuarter = this.quarterFilter.meetCriteria(data);
      // events.fire(AppConstants.EVENT_SLIDER_CHANGE, filterQuarter);
    });

    // Clears all filters and updates the appropriate sliders
    events.on(AppConstants.EVENT_CLEAR_FILTERS, (evt, data) => {
      SimpleLogging.log(AppConstants.EVENT_CLEAR_FILTERS, 0);
      this.updateQuarterFilter(json);
      const filterQuarter = this.quarterFilter.meetCriteria(json);
      const paraFilterData = this.paragraphFilter.meetCriteria(filterQuarter);
      d3.selectAll('input').property('checked', true);
      this.paragraphFilter.resetValues();

      $('.paraFilter').each((index, element) => {
        const value = $(element).val() as string;
        if($(element).is(':checked'))
        {
          this.paragraphFilter.addValue(value);
        }
      });

      events.fire(AppConstants.EVENT_SLIDER_CHANGE, paraFilterData);
      events.fire(AppConstants.EVENT_FILTER_DEACTIVATE_TOP_FILTER, 'changed');
      events.fire(AppConstants.EVENT_FILTER_CHANGED, 'changed');
    });

    // Listener for the change fo the top filter
    this.$node.select('#topFilter').on('change', (d) => {
      const value:string = $('#topFilter').val().toString();

      if(value === '0')
      {
        this.topFilter.active = true;
        this.topFilter.changeFilterTop(false);
        SimpleLogging.log('top filter', 'bottom');
      } else if(value === '1')
      {
        this.topFilter.active = true;
        this.topFilter.changeFilterTop(true);
        SimpleLogging.log('top filter', 'top');
      } else {
        this.topFilter.active = false;
        SimpleLogging.log('top filter', 'disabled');
      }
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    // Listener for the change of the paragraph elements
    $('.paraFilter').on('change', (d) => {
      this.paragraphFilter.resetValues();

      $('.paraFilter').each((index, element) => {
        const value = $(element).val() as string;
        if($(element).is(':checked'))
        {
          this.paragraphFilter.addValue(value);
        }
      });

      SimpleLogging.log('attribute filter', this.paragraphFilter.values);
      const filterQuarter = this.quarterFilter.meetCriteria(json);
      const paraFilterData = this.paragraphFilter.meetCriteria(filterQuarter);
      events.fire(AppConstants.EVENT_SLIDER_CHANGE, paraFilterData);
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    // Initializes the dialog for the time filter
    $('#btnTimeDialog').on('click', (e) => {
      // The Popup fades in just after
      $('#timeForm').fadeIn(600, function() {});
    });

    // Initializes the dialog for the attribute filter
    $('#btnAttributeDialog').on('click', (e) => {
      // The Popup fades in just after
      $('#attributeForm').fadeIn(600, function() {});
    });
  }

  /**
   * This method adds all the elements and options for the paragraph filter.
   * @param json with the data to be added.
   */
  private setParagraphFilterElements(json)
  {
    const paragraphs:Array<string> = [];
    for(const entry of json)
    {
      const val:string = entry.attribute1;
      // attribute1 column not present in row --> not add a checkbox here
      if (val !== undefined) {
        if(paragraphs.indexOf(val) === -1) {
          paragraphs.push(val);
          this.$node.select('#paragraph').append('input').attr('value',val).attr('type', 'checkbox')
            .attr('class','paraFilter form-check-input').attr('checked', true);
          this.$node.select('#paragraph').append('span')
            .attr('class', 'form-check-label')
            .attr('style', 'font-size: 1.0em; margin-left: 5px;').text(val);
          this.$node.select('#paragraph').append('span').attr('style', 'margin-left: 10px;');
        }
      }
    }
    this.paragraphFilter.values = paragraphs;

    //Dirty hack to handle §31 in media transparency data
    if (paragraphs.indexOf('31') !== -1) {
      d3.select('input[value = \'31\']').attr('checked', null);
      this.paragraphFilter.values = this.paragraphFilter.values.filter((e) => e.toString() !== '31');
    }

    //Set UI label dynamically based on CSV header
    const columnLabels : any = JSON.parse(localStorage.getItem('columnLabels'));
    if (columnLabels != null) {
      if (columnLabels.attribute1 !== undefined) {
        this.$node.select('#attr1_label').html(columnLabels.attribute1 + ' Filter');
      } else {
        //Attribute1 column not present in header --> empty UI label
        this.$node.select('#attr1_label').html('');
      }
    } else {
      this.$node.select('#attr1_label').html('Attribute Filter');
    }

    $('#attributeClose').on('click', function() {
      $('#attributeForm').fadeOut(200, function() {});
    });
  }

  private initializeQuarterFilter(json) {
    const timePoints = d3.set(
      json.map(function (d: any) { return d.timeNode; })
    ).values().sort();
    const ul = d3.select('#selectable');

    const result = $('#result');

    ul.selectAll('li')
      .data(timePoints)
      .enter()
      .append('li')
      .text((txt) => {
        const textParts = splitAt(4)(txt);
        return textParts[0] + 'Q' + textParts[1];
      })
      .attr('class', 'list-group-item')
      .filter(function(d, i) {
        return i === (timePoints.length - 1);
      })
      .attr('class', 'list-group-item ui-selected');

    let selectedTime = [];
    $('#selectable').selectable({
      selected: function() {
        result.empty();
        $('li.ui-selected').each(function(i, e) {
          const valueSelected = e.innerHTML
          result.append(' ' + valueSelected + ' ');
        });
      }
    });

    $('#btnUnSelectAll').on('click', function() {
      d3.select('#selectable').selectAll('li').classed('ui-selected', false);
      result.empty();
      result.append('Nothing selected');
    });

    $('#btnSelectAll').on('click', function() {
      d3.select('#selectable').selectAll('li').classed('ui-selected', true);
      result.empty();
      result.append('All selected');
    });

    $('#btnSelectedTime').on('click', function() {
      selectedTime = [];
      $('li.ui-selected').each(function(i, e) {
        const valueSelected = e.innerHTML;
        selectedTime.push(valueSelected.replace('Q', ''));
      });
      console.log('Selected time frame: ', selectedTime);
      $('#timeForm').fadeOut(200, function() {});
    });

    $('#timeClose').on('click', function() {
      $('#timeForm').fadeOut(200, function() {});
    });
  }
  /**
   * This method adds the slider for the time range.
   * @param json with the data to be added.
   */
  private setQuarterFilterRange(json)
  {
    const timePoints = d3.set(
      json.map(function (d: any) { return d.timeNode; })
    ).values().sort();

    const newMin: number = Number(timePoints[0]);
    const newMax: number = Number(timePoints[timePoints.length - 1]);
    this.quarterFilter.changeRange(newMax, newMax);

    $('#timeSlider').ionRangeSlider({
      type: 'double',
      min: 0,
      max: timePoints.length - 1,
      from: timePoints.length - 1,
      to: timePoints.length - 1,
      prettify(num) {
        return `` + TimeFormat.formatNumber(parseInt(timePoints[num], 10));
      },
      force_edges: true,  //Lets the labels inside the container
      drag_interval: true, //Allows the interval to be dragged around
      onFinish: (sliderData) => {
        // TODO here we rely on all timeNodes to be numbers
        const newMin: number = Number(timePoints[sliderData.from]);
        const newMax: number = Number(timePoints[sliderData.to]);
        this.quarterFilter.minValue = newMin;
        this.quarterFilter.maxValue = newMax;

        SimpleLogging.log('time slider', [newMin, newMax]);
        events.fire(AppConstants.EVENT_FILTER_CHANGED, json);

        //This notifies the sliders to change their values but only if the quarter slider changes
        const filterQuarter = this.quarterFilter.meetCriteria(json);
        const paraFilterData = this.paragraphFilter.meetCriteria(filterQuarter);
        events.fire(AppConstants.EVENT_SLIDER_CHANGE, paraFilterData);
      }
    });
    this.quarterFilterRef = $('#timeSlider').data('ionRangeSlider');
  }

  /**
   * This method updates the filter range of the quarter slider.
   * @param data the original data to read out the maximum number of time
   */
  private updateQuarterFilter(data) {
    const timePoints = d3.set(
      data.map(function (d: any) { return d.timeNode; })
    ).values().sort();

    const newMin: number = Number(timePoints[0]);
    const newMax: number = Number(timePoints[timePoints.length - 1]);
    this.quarterFilter.changeRange(newMax, newMax);
    this.quarterFilterRef.update({
      from: timePoints.length - 1,
      to: timePoints.length - 1
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
