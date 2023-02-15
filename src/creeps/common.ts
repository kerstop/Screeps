declare global {
  interface CreepMemory {
    role: Role;
  }
}

export enum Role {
  Worker = "worker",
  Harvester = "harvester",
}


export function tryGetFromId<T extends _HasId>(id: Id<T> | null): T | null {
  if (id === null) return null;
  return Game.getObjectById(id)
}
