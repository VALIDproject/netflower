/**
 * Defines the basic layout for a filter.
 */
interface Filter
{
  meetCriteria(data: any): any;
  printData(): void;
}

export default Filter;
