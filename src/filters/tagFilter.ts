import * as d3 from 'd3';
import Filter from './filter';
import EntityContainer from '../datatypes/entityContainer';

/**
 * This class is used to describe a value filter or filtering by value of the data set.
 */
export default class TagFilter implements Filter
{
  protected _resultData: Array<any>;
  protected _active: boolean;
  protected _availableTags: d3.Set;
  protected _activeTags: d3.Set;
  protected _container: EntityContainer;

  constructor()
  {
    this._availableTags = d3.set([]);
    this._activeTags = d3.set([]);
    this._resultData = new Array<any>();
    this._container = new EntityContainer();
    this._active = false;
  }

  get active():boolean
  {
    return this._active;
  }

  set active(active:boolean)
  {
    this._active = active;
  }

  get availableTags():d3.Set
  {
    return this._availableTags;
  }

  set availableTags(tags:d3.Set)
  {
    this._availableTags = tags;
  }

  get activeTags():d3.Set
  {
    return this._activeTags;
  }

  set activeTags(tags:d3.Set)
  {
    this._activeTags = tags;
  }

  //check if the value meets the entries tag value
  public meetCriteria(data: any): any
  {
    if(this._active) {
      this.processData(data);
      return this._resultData;
    }
    return data;
  }

  // Find all legal or media entities which are tagged by one of the selected tags
  protected processData(data: any): void
  {
  }

  public resetTags(): void {
    this._activeTags.forEach((value:string) => this._availableTags.add(value));
    this._activeTags = d3.set([]);
  }

  public addTag(val: string): void {
    this._availableTags.add(val);
  }

  public printData(): void
  {
  }
}
