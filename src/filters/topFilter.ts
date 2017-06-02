import Filter from './filter';

/**
 * This class is used to filter the data by either the upper best or the lowest ones.
 * Either by value or time or other criteria.
 */
export default class TopFilter implements Filter
{
  private resultData: Array<any>;
  private rechtstraeger: string;
  private active: boolean;

  constructor()
  {
    this.resultData = new Array<any>();
    this.active = false;
  }

  public switchActive(): void
  {
    this.active = !this.active;
  }

  public findTop(data: any): any
  {
    let map = new Map<string, number>();

    for(let entry of data)
    {
      let key = entry.rechtstraeger;
      let value:number = map.get(key);

      if(value === null || value === undefined)
      {
        map.set(key, Number(entry.euro));
      }
      else
      {
        let newValue:number = value + Number(entry.euro);
        map.set(key, newValue);
      }
    }

    let max:number = 0;
    map.forEach( (value, key, map) => {
      if(value > max)
      {
        max = value;
        this.rechtstraeger = key;
      }
    });
  }

  public meetCriteria(data: any): any
  {
    this.resultData = new Array<any>();

    if(!this.active)
      return data;

    this.findTop(data);

    for(let entry of data)
    {
      if(entry.rechtstraeger === this.rechtstraeger)
      {
        this.resultData.push(entry);
      }
    }

    return this.resultData;
  }

  public printData(): void
  {
    console.log('Top Filter: ');
  }
}
