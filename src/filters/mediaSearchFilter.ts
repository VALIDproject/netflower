import Filter from './filter';

/**
 * This class filters the data for a specific string and returns the media entities or targetNodes
 * that match this specific string.
 */
export default class MediaSearchFilter implements Filter
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
   * Here the search term as well as the targetNodes are transformed to lowercase and then checked with contains.
   * @param data where the search is performed on.
   * @returns {any} the result data with the filtered search.
   */
  public meetCriteria(data: any): any
  {
    let resultData = new Array<any>();

    if (this._term === null || this._term === undefined || this._term === '')
      return data;

    for (let entry of data)
    {
      let term = this._term.toLowerCase();
      let value = entry.targetNode.toLowerCase();
      // Value contains term?
      if(value.indexOf(term) !== -1)
        resultData.push(entry);
    }

    return resultData;
  }

  public printData(): void
  {
    console.log('Media Search Filter: ' + this._term);
  }
}
