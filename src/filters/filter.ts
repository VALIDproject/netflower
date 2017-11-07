/**
 * Defines the basic layout for a filter.
 */
interface Filter
{
  //method wich is called from the filterpipeline when calling the method performFilters
  meetCriteria(data: any): any;
  //method to print the actual filter charateristics
  printData(): void;
}

export default Filter;
