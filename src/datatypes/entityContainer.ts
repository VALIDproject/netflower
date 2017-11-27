import Entity from './entity';

/**
 * This class is used to store a number of entity objects within a container. This arra yor list contains noraml
 * entity objects and offers some operations on it, e.g. finiding a specific one by name. For example "Agramarkt Austria".
 */
export default class EntityContainer
{
  private _entities: Array<Entity>

  public constructor()
  {
    this._entities = new Array<Entity>();
  }

  /**
   * Adds an entity to the container.
   * @param ent entity to add.
   */
  public addEntity(ent: Entity): void
  {
    this._entities.push(ent);
  }

  /**
   * Finds an entity in the container and returns the object.
   * @param id of the entity to find which is basically the name.
   * @returns {Entity} the entity and all it's properties.
   */
  public findEntity(id: String): Entity
  {
    for(let ent of this._entities)
    {
      if(ent.identifier === id)
        return ent;
    }

    return null;
  }

  /**
   * Removes all entities from a container.
   */
  public clearEntities(): void
  {
    this._entities = new Array<Entity>();
  }

  /**
   * Removes a specific entity from the container.
   * @param ent to be removed.
   */
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
