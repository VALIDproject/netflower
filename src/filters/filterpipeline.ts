import Filter from './filter';
import EntitySearchFilter from './entitySearchFilter';
import MediaSearchFilter from './mediaSearchFilter';

/**
 * This class represents the whole filter pipeline where all filters are added and processed.
 */
export default class FilterPipeline
{
  private filters: Array<Filter>;
  private static instance: FilterPipeline;
  private _attributeFilters = new Array<Filter>();

  // Top filter has to be the first filter of the pipeline and therefore is stored separately
  // private _topFilter: TopFilter;
  // Search filters have to be right after the topFilter and therefore are also stored separately
  private _entitySearchFilter: EntitySearchFilter;
  private _mediaSearchFilter: MediaSearchFilter;

  private constructor()
  {
    this.filters = new Array<Filter>();
  }

  // Class is a singeltone an therefore only one object can exist => get object with this method
  public static getInstance(): FilterPipeline
  {
    if (FilterPipeline.instance === null || FilterPipeline.instance === undefined)
    {
      FilterPipeline.instance = new FilterPipeline();
    }

    return FilterPipeline.instance;
  }

  /**
   * Add a filter to the pipeline where all filters are connected with the AND operator.
   * @param newFilter to be added to the pipeline.
   */
  public addFilter(newFilter: Filter): void
  {
    if (newFilter !== null || newFilter !== undefined)
    {
      this.filters.push(newFilter);
    }
  }

  /**
   * Add a filter to the pipeline and mark it as an attribute filter.
   * Sparkline Barcharts are only filtered by attribute filter and nothing else.
   * @param newFilter to be added to the pipeline.
   */
  public addAttributeFilter(newFilter: Filter): void
  {
    if (newFilter !== null || newFilter !== undefined)
    {
      this.filters.push(newFilter);
      this._attributeFilters.push(newFilter);
    }
  }

  /**
   * This is used to change the stored topFilter.
   * @param newTop which will be used as filter.
   */
  // public changeTopFilter(newTop: TopFilter): void
  // {
  //   this._topFilter = newTop;
  // }

  /**
   * Changes the stored entitySearchFilter.
   * @param newEntSearch term to filter.
   */
  public changeEntitySearchFilter(newEntSearch: EntitySearchFilter): void
  {
    this._entitySearchFilter = newEntSearch;
  }

  /**
   * Changes the stored mediaSearchFilter.
   * @param newMedSearch term to filter.
   */
  public changeMediaSearchFilter(newMedSearch: MediaSearchFilter): void
  {
    this._mediaSearchFilter = newMedSearch;
  }

  /**
   * This method performs all filters in the pipeline and additionally the time filter,
   * entitySearchFilter and mediaSearchFilter which are special ones.
   * @param data to perform the filter pipeline on.
   * @returns {any} the filtered data.
   */
  public performFilters(data: any): any
  {
    if (this._entitySearchFilter !== null && this._entitySearchFilter !== undefined)
      data = this._entitySearchFilter.meetCriteria(data);

    if (this._mediaSearchFilter !== null && this._mediaSearchFilter !== undefined)
      data = this._mediaSearchFilter.meetCriteria(data);

    for (let filter of this.filters)
    {
        data = filter.meetCriteria(data);
    }
    return data;
  }

  /**
   * Only apply filters marked as attribute filter
   * @param data
   */
  public performAttributeFilters(data: any): any
  {
    for (let filter of this._attributeFilters)
    {
      data = filter.meetCriteria(data);
    }
    return data;
  }

  /**
   * This method prints the filter charateristics of all filters.
   */
  public printFilters(): void
  {
    console.log('Filter Count: ' + (this.filters.length+3));
    this._entitySearchFilter.printData();
    this._mediaSearchFilter.printData();
    for (let filter of this.filters)
    {
      filter.printData();
    }
  }
}
