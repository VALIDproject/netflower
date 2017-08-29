import Filter from './filter';

/**
 * This class is used to describe a value filter or filtering by value of the data set.
 */
export default class ParagraphFilter implements Filter
{
  private resultData: Array<any>;

  private _values: Array<number>;

  constructor()
  {
    this.resultData = new Array<any>();
    this._values = new Array<number>();
  }

  get values():Array<number>
  {
    return this._values;
  }

  set values(val:Array<number>)
  {
    this._values = val;
  }

  //check if the value meets the entries paragraph value
  public meetCriteria(data: any): any
  {
    this.resultData = new Array<any>();

    for(let entry of data)
    {
      let para:number = entry.attribute1;

      for(let value of this._values) {
        if (para === value) {
          this.resultData.push(entry);
        }
      }
    }

    return this.resultData;
  }

  public resetValues(): void
  {
    this._values = new Array<number>();
  }

  public addValue(val: number): void
  {
    this._values.push(val);
  }

  public printData(): void
  {
    console.log('Paragraph Filter: ' + this.values);
  }
}
