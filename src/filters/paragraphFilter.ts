import Filter from './filter';
import * as d3 from 'd3';

/**
 * This class is used to describe a value filter or filtering by value of the data set.
 */
export default class ParagraphFilter implements Filter
{
  private resultData: Array<any>;

  private queriedValues: d3.Set;

  constructor()
  {
    this.queriedValues = d3.set([]);
  }

  get values():Array<string>
  {
    return this.queriedValues.values();
  }

  set values(val:Array<string>)
  {
    this.queriedValues = d3.set(val);
  }

  //check if the value meets the entries paragraph value
  public meetCriteria(data: any): any
  {
    this.resultData = data.filter((d) => {
      // attribute1 column not present in row --> it meets the criteria (typically a dataset without an attribute column)
      return (d.attribute1 === undefined) || this.queriedValues.has(d.attribute1);
    });

    return this.resultData;
  }

  public resetValues(): void {
    this.queriedValues = d3.set([]);
  }

  public addValue(val: string): void {
    this.queriedValues.add(val);
  }

  public printData(): void
  {
    console.log('Paragraph Filter: ' + this.values);
  }
}
