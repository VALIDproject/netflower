import Filter from './filter';
import EntitySearchFilter from './entitySearchFilter';
import MediaSearchFilter from './mediaSearchFilter';
import TopFilter from './topFilter';

/**
 * This class represents the whole filter pipeline where all filters are added and processed.
 */
export default class FilterPipeline
{
  private filters: Array<Filter>;
  private static instance: FilterPipeline;

  private _topFilter: TopFilter;
  private _entitySearchFilter: EntitySearchFilter;
  private _mediaSearchFilter: MediaSearchFilter;

  private constructor()
  {
    this.filters = new Array<Filter>();
  }

  public static getInstance(): FilterPipeline
  {
    if(FilterPipeline.instance === null || FilterPipeline.instance === undefined)
    {
      FilterPipeline.instance = new FilterPipeline();
    }

    return FilterPipeline.instance;
  }

  public addFilter(newFilter: Filter): void
  {
    if(newFilter !== null || newFilter !== undefined)
    {
      this.filters.push(newFilter);
    }
  }

  public changeTopFilter(newTop: TopFilter): void
  {
    this._topFilter = newTop;
  }

  public changeEntitySearchFilter(newEntSearch: EntitySearchFilter): void
  {
    this._entitySearchFilter = newEntSearch;
  }

  public changeMediaSearchFilter(newMedSearch: MediaSearchFilter): void
  {
    this._mediaSearchFilter = newMedSearch;
  }

  public performFilters(data: any): any
  {
    if(this._topFilter !== null && this._topFilter !== undefined)
      data = this._topFilter.meetCriteria(data);

    if(this._entitySearchFilter !== null && this._entitySearchFilter !== undefined)
      data = this._entitySearchFilter.meetCriteria(data);

    if(this._mediaSearchFilter !== null && this._mediaSearchFilter !== undefined)
      data = this._mediaSearchFilter.meetCriteria(data);

    for(let filter of this.filters)
    {
        data = filter.meetCriteria(data);
    }
    return data;
  }

  public printFilters(): void
  {
    console.log('Filter Count: ' + this.filters.length);
    for(let filter of this.filters)
    {
      filter.printData();
    }
  }

}
