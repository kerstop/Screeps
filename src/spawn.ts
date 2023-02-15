import { Role } from "creeps/common"
import * as worker from "creeps/worker";

function initRoleMem(role: Role): CreepMemory {
  switch (role) {
    case Role.Worker:
      return worker.initWorkerMem();
    default:
      throw new Error("unrecognized role");
  }
}

function spawnCreepWithMemory(spawn: StructureSpawn, body:BodyPartConstant[], role: Role) {
    spawn.spawnCreep(body, `${role}-${spawn.name}-${Game.time}`, {memory: initRoleMem(role)} )
}

export function runSpawn(spawn: StructureSpawn) {
  let num_creeps = 0;
  for(let _ in Game.creeps) num_creeps++;
  if(num_creeps < 10)
    spawnCreepWithMemory(spawn, [WORK, MOVE, CARRY], Role.Worker)
}
