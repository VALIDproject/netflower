import Entity from './entity';

export default class EntityContainer
{

  private _entities: Array<Entity>

  public constructor()
  {
    this._entities = new Array<Entity>();
  }

  public addEntity(ent: Entity): void
  {
    this._entities.push(ent);
  }

  public findEntity(id: String): Entity
  {
    for(let ent of this._entities)
    {
      if(ent.identifier === id)
        return ent;
    }

    return null;
  }

  public clearEntities(): void
  {
    this._entities = new Array<Entity>();
  }

  public removeEntity(ent: Entity): void
  {
    let index = this._entities.indexOf(ent);
    this._entities.splice(index);
  }

  get entities():Array<Entity>
  {
    return this._entities;
  }
}
