import Filter from './filter';

/**
 * This class is used to filter the data by tag flows.
 * Either by value or time or other criteria.
 */
export default class TagFlowFilter implements Filter
{
  private resultData: Array<any>;

  private _active: boolean;
  private filterEntries: Array<string>;

  constructor()
  {
    this.resultData = new Array<any>();
    this.filterEntries = new Array<string>();
    this.active = false;
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
   * Determines if the aggregated sankey view should be displayed
   * @param {boolean} top
   */
  public changeFilterTagFlow(flow: boolean)
  {
    this._active = flow;
  }

  /**
   * Method to find the nodes that are tagged and their respective monetary flow
   * @param data containing the nodes
   * @returns {any} set of nodes that are grouped by tag label and aggregated by their monetary flow
   */
  public findTagFlows(data: any): any
  {
    //creating an empty map an fill group all entities and and calulcate the total of all payments
    let map = new Map<string, number>();
    this.filterEntries = new Array<string>();

    for(let entry of data)
    {
      let key = entry.sourceTag;
      let relatedTag = entry.targetTag;
      if ((key !== '') && (key !== undefined) && (relatedTag !== '') && (relatedTag !== undefined)) {
        let value: number = map.get(key);

        if (value === null || value === undefined) {
          map.set(key, Number(entry.valueNode));
        }
        else {
          let newValue: number = value + Number(entry.valueNode);
          map.set(key, newValue);
        }
      }
    }

    //sort the entities from top to bottom
    let arr = [];
    map.forEach( (value, key, map) => {
      arr.push({key, value});
    });

    arr.sort(function(a, b)
    {
      return (<number>b.value) - (<number>a.value);
    });

    //add the wanted entities to the filter entities
    for (let index in arr)
    {
      let entry = arr[index].key;
      this.filterEntries.push(entry);
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

    if(!this._active)
      return data;

    this.findTagFlows(data);

    for(let entry of data)
    {
      for(let filterEntry of this.filterEntries)
      {
        if(entry.sourceTag === filterEntry)
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
