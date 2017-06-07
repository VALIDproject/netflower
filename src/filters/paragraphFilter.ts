import Filter from './filter';

/**
 * This class is used to describe a value filter or filtering by value of the data set.
 */
export default class ParagraphFilter implements Filter
{
  private resultData: Array<any>;

  private _value: number;
  private _active: boolean;

  constructor()
  {
    this.resultData = new Array<any>();
  }

  get active():boolean
  {
    return this._active;
  }

  set active(act:boolean)
  {
    this._active = act;
  }

  get value():number
  {
    return this._value;
  }

  set value(val:number)
  {
    this._value = val;
  }

  public meetCriteria(data: any): any
  {
    this.resultData = new Array<any>();

    if(!this.active)
      return data;

    for(let entry of data)
    {
      let para:number = entry.attribute1;

      if(para === this.value)
      {
        this.resultData.push(entry);
      }
    }

    return this.resultData;
  }

  public printData(): void
  {
    console.log('Paragraph Filter: ' + this.value);
  }
}
