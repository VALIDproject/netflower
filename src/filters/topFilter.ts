import Filter from './filter';

/**
 * This class is used to filter the data by either the upper best or the lowest ones.
 * Either by value or time or other criteria.
 */
export default class TopFilter implements Filter
{
  private resultData: Array<any>;

  private _active: boolean;
  private filterTop: boolean;
  private filterEntries: Array<string>;

  constructor()
  {
    this.resultData = new Array<any>();
    this.filterEntries = new Array<string>();
    this.active = false;
    this.filterTop = true;
  }

  get active():boolean
  {
    return this._active;
  }

  set active(act:boolean)
  {
    this._active = act;
  }

  /**
   * Determine if the filter should filter the top or bottom 10.
   * @param top boolean to change the filteres.
   */
  public changeFilterTop(top: boolean)
  {
    this.filterTop = top;
  }

  /**
   * Method to find the top or bottom 10 legal entities and all their corresponding payments!
   * @param data to perform the search on.
   */
  public findTop(data: any): any
  {
    // Creating an empty map an fill group all entities and and calulcate the total of all payments
    let map = new Map<string, number>();
    this.filterEntries = new Array<string>();

    for (let entry of data)
    {
      let key = entry.sourceNode;
      let value: number = map.get(key);

      if (value === null || value === undefined)
      {
        map.set(key, Number(entry.valueNode));
      }
      else
      {
        let newValue: number = value + Number(entry.valueNode);
        map.set(key, newValue);
      }
    }

    // Sort the entities from top to bottom
    let arr = [];
    map.forEach( (value, key, map) => {
      arr.push({key, value});
    });

    arr.sort(function(a, b)
    {
      return (<number>b.value) - (<number>a.value);
    });

    // If filter top set the range from 0-10
    // If filter bottom set the range from length-10 to length
    let index: number = 0;
    let max: number = 0;

    if (!this.filterTop)
    {
      index = arr.length - 10;
      max = arr.length;
    }
    else {
      index = 0;
      max = 10;
    }
    // Add the wanted entities to the filter entities
    while (index < max)
    {
      let entry = arr[index].key;
      this.filterEntries.push(entry);
      index++;
    }
  }

  /**
   * This checks wether the data contains the filter options or not or the necessary information.
   * @param data to perfrom the filter on.
   * @returns {any} the resulting array of data.
   */
  public meetCriteria(data: any): any
  {
    this.resultData = new Array<any>();

    if (!this._active)
      return data;

    this.findTop(data);

    for (let entry of data)
    {
      for (let filterEntry of this.filterEntries)
      {
        if (entry.sourceNode === filterEntry)
        {
          this.resultData.push(entry);
        }
      }
    }

    return this.resultData;
  }

  public printData(): void
  {
    console.log('Top Filter: ' + this.filterEntries);
  }
}

// TODO: Find the bug with the top filter not updateing the euro filters for media and legal entity as this reduces
// the array further to nearly nothing. The ranges have to be updated as well in order to reflect this in the euro filter.
