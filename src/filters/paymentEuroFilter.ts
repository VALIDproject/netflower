import Filter from './filter';

/**
 * This class is used to describe a value filter or filtering by value of the data set.
 */
export default class PaymentEuroFilter implements Filter
{
  private resultData: Array<any>;

  private _minValue: number;
  private _maxValue: number;

  constructor()
  {
    this.resultData = new Array<any>();
  }

  get minValue():number
  {
    return this._minValue;
  }

  set minValue(min:number)
  {
    this._minValue = min;
  }

  get maxValue():number
  {
    return this._maxValue;
  }

  set maxValue(max:number)
  {
    this._maxValue = max;
  }

  public changeRange(minValue: number, maxValue: number)
  {
    this.minValue = minValue;
    this.maxValue = maxValue;
  }

  //check if the value is in the given range
  public meetCriteria(data: any): any
  {
    this.resultData = new Array<any>();

    for(let entry of data)
    {
      let euro:number = entry.valueNode;

      if(euro >= this.minValue && euro <= this.maxValue)
      {
        this.resultData.push(entry);
      }
    }

    return this.resultData;
  }

  public printData(): void
  {
    console.log('Euro Filter: ' + this.minValue + ' / ' + this.maxValue);
  }
}
