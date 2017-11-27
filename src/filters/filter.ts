/**
 * Defines the basic layout for a filter.
 */
interface Filter
{
  // Method which is called from the filterpipeline when calling the method performFilters
  meetCriteria(data: any): any;
  // Method to print the actual filter charateristics
  printData(): void;
}

export default Filter;
