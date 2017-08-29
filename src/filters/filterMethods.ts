/**
 * Created by Florian on 17.08.2017.
 */
import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import 'ion-rangeslider';
import 'style-loader!css-loader!ion-rangeslider/css/ion.rangeSlider.css';
import 'style-loader!css-loader!ion-rangeslider/css/ion.rangeSlider.skinFlat.css';
import {AppConstants} from '../app_constants';
import {roundToFull} from '../utilities';
import FilterPipeline from './filterpipeline';
import EntityEuroFilter from './entityEuroFilter';
import MediaEuroFilter from './mediaEuroFilter';
import EntitySearchFilter from './entitySearchFilter';
import MediaSearchFilter from './mediaSearchFilter';
import PaymentEuroFilter from './paymentEuroFilter';

let entityFilterRef;
let mediaFilterRef;
let valueFilterRef;

/**
 * This method creates the slider for the entity range filter with given parameters.
 * @param filter the filter data
 * @param elemName the element where the slider gets created on
 * @param data the data for the slider to dermin the range
 */
export function setEntityFilterRange(filter, elemName: string, data: any)
{
  filter.calculateMinMaxValues(data);
  let min: number = roundToFull(filter.minValue);
  let max: number = roundToFull(filter.maxValue);

  $(elemName).ionRangeSlider({
    type: 'double',
    min: min,
    max: max,
    prettify_enabled: true,
    prettify_separator: '.',
    force_edges: true,      //Lets the labels inside the container
    min_interval: min * 2,  //Forces at least 1000 to be shown in order to prevent errors
    drag_interval: true,    //Allows the interval to be dragged around
    onFinish: (sliderData) => {
      let newMin: number = sliderData.from;
      let newMax: number = sliderData.to;
      filter.minValue = newMin;
      filter.maxValue = newMax;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, data);
    },
  });

  entityFilterRef = $(elemName).data('ionRangeSlider');    //Store instance to update it later
}

/**
 * This method is used in order ot update the entity range slider.
 * @param filter the filter with the base data
 * @param data the data to update the slider with
 */
export function updateEntityRange(filter, data: any) {
  filter.calculateMinMaxValues(data);
  let min: number = roundToFull(filter.minValue);
  let max: number = roundToFull(filter.maxValue);

  entityFilterRef.update({
    min: min,
    max: max
  });
}

/**
 * This method creates the slider for the media range filter with given parameters.
 * @param filter the filter data
 * @param elemName the element where the slider gets created on
 * @param data the data for the slider to dermin the range
 */
export function setMediaFilterRange(filter, elemName: string, data: any): void
{
  filter.calculateMinMaxValues(data);
  let min: number = roundToFull(filter.minValue);
  let max: number = roundToFull(filter.maxValue);

  $(elemName).ionRangeSlider({
    type: 'double',
    min: min,
    max: max,
    prettify_enabled: true,
    prettify_separator: '.',
    force_edges: true,        //Lets the labels inside the container
    min_interval: min * 2,    //Forces at least 1000 to be shown in order to prevent errors
    drag_interval: true,      //Allows the interval to be dragged around
    onFinish: (sliderData) => {
      let newMin: number = sliderData.from;
      let newMax: number = sliderData.to;
      filter.minValue = newMin;
      filter.maxValue = newMax;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, data);
    }
  });

  mediaFilterRef = $(elemName).data('ionRangeSlider');    //Store instance to update it later
}

/**
 * This method is used in order ot update the media range slider.
 * @param filter the filter with the base data
 * @param data the data to update the slider with
 */
export function updateMediaRange(filter, data: any) {
  filter.calculateMinMaxValues(data);
  let min: number = roundToFull(filter.minValue);
  let max: number = roundToFull(filter.maxValue);

  mediaFilterRef.update({
    min: min,
    max: max
  });
}

/**
 * This method creates the slider for the value range filter with given parameters.
 * @param filter the filter data
 * @param elemName the element where the slider gets created on
 * @param data the data for the slider to dermin the range
 */
export function setEuroFilterRange(filter, elemName: string, data: any): void {
  let min: number = data[0].valueNode;
  let max: number = data[0].valueNode;
  for (let entry of data) {
    let value: number = Number(entry.valueNode);
    if (value < min) min = value;
    if (value > max) max = value;
  }
  min = roundToFull(min);
  max = roundToFull(max);
  filter.changeRange(min, max);

  $(elemName).ionRangeSlider({
    type: 'double',
    min: min,
    max: max,
    prettify_enabled: true,
    prettify_separator: '.',
    force_edges: true,        //Lets the labels inside the container
    min_interval: min * 2,    //Forces at least 1000 to be shown in order to prevent errors
    drag_interval: true,      //Allows the interval to be dragged around
    onFinish: (sliderData) => {
      let newMin: number = sliderData.from;
      let newMax: number = sliderData.to;
      filter.minValue = newMin;
      filter.maxValue = newMax;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, data);
    }
  });

  valueFilterRef = $(elemName).data('ionRangeSlider');    //Store instance to update it later

}

/**
 * This method is used in order ot update the value range slider.
 * @param filter the filter with the base data
 * @param data the data to update the slider with
 */
export function updateEuroRange(filter, data: any) {
  let min: number = data[0].valueNode;
  let max: number = data[0].valueNode;
  for (let entry of data) {
    let value: number = Number(entry.valueNode);
    if (value < min) min = value;
    if (value > max) max = value;
  }
  min = roundToFull(min);
  max = roundToFull(max);
  filter.changeRange(min, max);

  valueFilterRef.update({
    min: min,
    max: max
  });
}
