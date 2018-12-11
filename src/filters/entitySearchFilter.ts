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

    // This will check if the term is set basically
    if (this._term === null || this._term === undefined || this._term === '')
      return data;

    // This will check if the term is in double quotes, which means we make an exact match
    if (this._term.charAt(0) === '"' && this._term.charAt(this._term.length-1) === '"'){
      // Remove the double quotes
      this._term = this._term.substring(1, this._term.length-1);

      for (let entry of data) {
        let termLower = this._term.toLowerCase();
        let valueLower = entry.sourceNode.toLowerCase();

        if (valueLower === termLower)
          resultData.push(entry);
      }
    }
    else {
      for (let entry of data) {
        let term = this._term.toLowerCase();
        let value = entry.sourceNode.toLowerCase();
        // Value contains term?
        if (value.indexOf(term) !== -1)
          resultData.push(entry);
      }
    }

    return resultData;
  }

  public printData(): void
  {
    console.log('Entity Search Filter: ' + this._term);
  }
}
