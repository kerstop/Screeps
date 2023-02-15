import { ErrorMapper } from "utils/ErrorMapper";
import { Role } from "creeps/common";
import { runSpawn } from "spawn";
import { isWorker, runWorker } from "creeps/worker";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  for (const spawn in Game.spawns) {
    runSpawn(Game.spawns[spawn]);
  }

  for (const key in Game.creeps) {
    let creep = Game.creeps[key];
    try {
      if (isWorker(creep)) runWorker(creep);
    } catch (error) {
      // Catch any error so that only the one creep stops.

      if (error instanceof Error) {
        console.log(
        `creep ${creep.name} threw the following error:\n`,
        `${error.message}\n`,
        `Stack Trace:\n`,
        `${ErrorMapper.sourceMappedStackTrace(error.stack?? "")}`);
      }
    }
  }
});
