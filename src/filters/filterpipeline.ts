import Filter from './filter';
import EntitySearchFilter from './entitySearchFilter';
import MediaSearchFilter from './mediaSearchFilter';
import TopFilter from './topFilter';
import TagFlowFilter from './tagFlowFilter';

/**
 * This class represents the whole filter pipeline where all filters are added and processed.
 */
export default class FilterPipeline
{
  private filters: Array<Filter>;
  private static instance: FilterPipeline;

  //top filter has to be the first filter of the pipeline and therefore is stored separately
  private _topFilter: TopFilter;
  //search filters have to be right after the topFilter and therefore are also stored separately
  private _entitySearchFilter: EntitySearchFilter;
  private _mediaSearchFilter: MediaSearchFilter;
  // tag flow filter as a separate filter as it has no relation to the three filters above
  private _tagFlowFilter: TagFlowFilter;

  private _attributeFilters = new Array<Filter>();

  private constructor()
  {
    this.filters = new Array<Filter>();
  }

  //class is a singeltone an therefore only one object can exist => get object with this method
  public static getInstance(): FilterPipeline
  {
    if(FilterPipeline.instance === null || FilterPipeline.instance === undefined)
    {
      FilterPipeline.instance = new FilterPipeline();
    }

    return FilterPipeline.instance;
  }

  //add a filter to the pipeline; all filters are connected with the AND operator
  public addFilter(newFilter: Filter): void
  {
    if(newFilter !== null || newFilter !== undefined)
    {
      this.filters.push(newFilter);
    }
  }

  /**
   * add a filter to the pipeline and mark it as an attribute filter.
   * Sparkline Barcharts are only filtered by attribute filter and nothing else.
   * @param newFilter
   */
  public addAttributeFilter(newFilter: Filter): void
  {
    if(newFilter !== null || newFilter !== undefined)
    {
      this.filters.push(newFilter);
      this._attributeFilters.push(newFilter);
    }
  }

  //change the stored topFilter
  public changeTopFilter(newTop: TopFilter): void
  {
    this._topFilter = newTop;
  }

  //change the stored entitySearchFilter
  public changeEntitySearchFilter(newEntSearch: EntitySearchFilter): void
  {
    this._entitySearchFilter = newEntSearch;
  }

  //change the stored mediaSearchFilter
  public changeMediaSearchFilter(newMedSearch: MediaSearchFilter): void
  {
    this._mediaSearchFilter = newMedSearch;
  }

  public changeTagFlowFilter(newTagFlow: TagFlowFilter): void
  {
    this._tagFlowFilter = newTagFlow;
  }

  public getTagFlowFilterStatus(): boolean
  {
    return this._tagFlowFilter.active;
  }

  //this method performs all filters in the pipeline and additionally the topFilter, entitySearchFilter and MediaSearchFilter
  public performFilters(data: any): any
  {
    if(this._tagFlowFilter.active) {
      if(this._tagFlowFilter !== null && this._tagFlowFilter !== undefined) {
        console.log("tagflowFfilter: " + (this._tagFlowFilter !== null) + ", " + (this._tagFlowFilter !== undefined));
        data = this._tagFlowFilter.meetCriteria(data);
      }
    } else {
      if(this._topFilter !== null && this._topFilter !== undefined)
        data = this._topFilter.meetCriteria(data);

      if(this._entitySearchFilter !== null && this._entitySearchFilter !== undefined)
        data = this._entitySearchFilter.meetCriteria(data);

      if(this._mediaSearchFilter !== null && this._mediaSearchFilter !== undefined)
        data = this._mediaSearchFilter.meetCriteria(data);
    }

    for(let filter of this.filters)
    {
      data = filter.meetCriteria(data);
    }
    return data;
  }

  /**
   * only apply filters marked as attribute filter
   * @param data
   */
  public performAttributeFilters(data: any): any
  {
    for(let filter of this._attributeFilters)
    {
          data = filter.meetCriteria(data);
    }
    return data;
  }

  //this method prints the filter charateristics of all filters
  public printFilters(): void
  {
    console.log('Filter Count: ' + (this.filters.length+3));
    this._topFilter.printData();
    this._entitySearchFilter.printData();
    this._mediaSearchFilter.printData();
    for(let filter of this.filters)
    {
      filter.printData();
    }
  }

}
