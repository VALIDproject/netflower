import Entity from './entity';
import {type} from 'os';

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
    this._entities.splice(index, 1);
  }

  /**
   * This filters an entity container by an array that is converted to a Set. The Set allows a iteration and guarantees
   * that the indices stay as well as the uniqueness of the values. It will remove all entities that are in the passed
   * array.
   * @param toRemove array that contains indices that are removed.
   */
  public filterEntityContainer(toRemove: number[]): void
  {
    let set = new Set(toRemove);
    this._entities = this._entities.filter((_, index) => !set.has(index));
  }

  get entities():Array<Entity>
  {
    return this._entities;
  }
}
