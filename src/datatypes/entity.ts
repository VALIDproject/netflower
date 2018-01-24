import Payment from './payment';

/**
 * This class is used to describe an entity, e.g. "Agrarmarkt Austria" and all it's properties as well as the
 * total amount of money they spent or got in a given time frame.
 */
export default class Entity
{
  private _payments: Array<Payment>;
  private _totalAmount: number;
  private _identifier: String;

  public constructor(id: String)
  {
    this._payments = new Array<Payment>();
    this._totalAmount = 0;
    this._identifier = id;
  }

  /**
   * Pushes a new payment to the properties array of an entity, if the payment is defined and not null.
   * @param value of the payment that should be added to an entities property.
   */
  public addPayment(value: number):void
  {
    let p = new Payment(value);
    if(p !== null || p !== undefined)
    {
      this._payments.push(p);
    }
  }

  /**
   * Calculates the total amount of payments from an entity it recived in the given time frame.
   */
  private calculateTotalAmount()
  {
    let calc: number = 0;
    for(let p of this._payments)
    {
      calc += Number(p.amount);
    }

    this._totalAmount = calc;
  }

  get totalAmount():number
  {
    this.calculateTotalAmount();
    return this._totalAmount;
  }

  get identifier():String
  {
    return this._identifier;
  }

  set identifier(id: String)
  {
    this._identifier = id;
  }
}
