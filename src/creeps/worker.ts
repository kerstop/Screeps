import { Role, tryGetFromId } from "creeps/common";

interface WorkerMemory extends CreepMemory {
  role: Role.Worker;
  source: Id<Source> | null;
  state: WorkerState;
  deliver_target: Id<Structure> | null;
}

export interface WorkerCreep extends Creep {
  memory: WorkerMemory;
}

enum WorkerState {
  harvest,
  deliver,
  upgrade
}

export function isWorker(creep: Creep): creep is WorkerCreep {
  return creep.memory.role === Role.Worker;
}

export function initWorkerMem(): WorkerMemory {
  return {
    role: Role.Worker,
    state: WorkerState.harvest,
    source: null,
    deliver_target: null
  };
}

export function runWorker(creep: WorkerCreep) {
  switch (creep.memory.state) {
    case WorkerState.harvest:
      harvestState(creep);
      break;
    case WorkerState.deliver:
      deliverState(creep);
      break;
    case WorkerState.upgrade:
      upgradeState(creep);
      break;
    default:
      throw new Error("Memory misconfigured");
  }
}

function harvestState(creep: WorkerCreep) {
  const source: Source =
    tryGetFromId(creep.memory.source) ??
    (() => {
      let s = creep.pos.findClosestByPath(FIND_SOURCES);

      if (s === null) throw new Error("Couldn't find source");
      creep.memory.source = s.id;
      return s;
    })();

  if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
    creep.moveTo(source);
  }

  if (creep.store.getFreeCapacity() === 0) {
    creep.memory.state = WorkerState.deliver;
    runWorker(creep);
  }
}

function deliverState(creep: WorkerCreep) {
  const target: Structure | undefined =
    tryGetFromId(creep.memory.deliver_target) ??
    creep.room
      .find(FIND_MY_STRUCTURES)
      .filter(struct => {
        if(struct.structureType ===STRUCTURE_SPAWN) {
          return struct.store.energy!== SPAWN_ENERGY_CAPACITY
        } else if (struct.structureType === STRUCTURE_EXTENSION) {
          return struct.store.energy !== EXTENSION_ENERGY_CAPACITY[struct.room.controller?.level??0]
        }
        return false;
      })
      .pop();

  if (target === undefined) {
    creep.memory.state = WorkerState.upgrade;
    runWorker(creep);
    return;
  }

  switch (creep.transfer(target, RESOURCE_ENERGY)) {
    case ERR_NOT_IN_RANGE:
      creep.moveTo(target.pos);
      break;
    case ERR_FULL:
      creep.memory.deliver_target = null;
      runWorker(creep);
      break;
  }

  if (creep.store.energy === 0) {
    creep.memory.state = WorkerState.harvest;
    runWorker(creep);
    return;
  }
}

function upgradeState(creep: WorkerCreep) {
  const controller = creep.room.controller;
  if (controller === undefined) {
    throw new Error(`No controller to upgrade in room ${creep.room}`);
  }
  if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
    creep.moveTo(controller);
  }

  if (creep.store.energy === 0) {
    creep.memory.state = WorkerState.harvest;
    runWorker(creep);
    return;
  }
}
