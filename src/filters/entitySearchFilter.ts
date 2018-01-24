import Filter from './filter';

/**
 * This class is used to search for a specific string or word inside the legal entities or sourceNodes.
 */
export default class EntitySearchFilter implements Filter
{

  private _term: String = '';

  get term(): String
  {
    return this._term;
  }

  set term(newTerm: String)
  {
    this._term = newTerm;
  }

  /**
   * Here the search term as well as the sourceNodes are transformed to lowercase and then checked if they
   * contain the given term.
   * @param data where the search happens.
   * @returns {any} the filtered data.
   */
  public meetCriteria(data: any): any
  {
    let resultData = new Array<any>();

    if (this._term === null || this._term === undefined || this._term === '')
      return data;

    for (let entry of data)
    {
      let term = this._term.toLowerCase();
      let value = entry.sourceNode.toLowerCase();
      // Value contains term?
      if(value.indexOf(term) !== -1)
        resultData.push(entry);
    }

    return resultData;
  }

  public printData(): void
  {
    console.log('Entity Search Filter: ' + this._term);
  }
}
