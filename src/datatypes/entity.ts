import Payment from './payment';


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

  public addPayment(value: number):void
  {
    let p = new Payment(value);
    if(p !== null || p !== undefined)
    {
      this._payments.push(p);
    }
  }

  private calculateTotalAmount()
  {
    let calc: number = 0;
    for(let p of this._payments)
    {
      calc += p.amount;
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
