import Filter from './filters/filter';


export default class FilterPipeline
{
  private filters: Array<Filter>;
  private static instance: FilterPipeline;

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

  public performFilters(data: any): any
  {
    for(let filter of this.filters)
    {
        data = filter.meetCriteria(data);
    }

    return data;
  }

  public printFilters(): void
  {
    console.log("Filter Count: " + this.filters.length);
    for(let filter of this.filters)
    {
      filter.printData();
    }
  }

}
