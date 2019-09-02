import { Command } from '../interface';

const command: Command = {
  name: '',

  params: {},

  canExecute() {
    return true;
  },

  canUndo() {
    return true;
  },

  init() {},

  execute() {},

  undo() {},

  shortcuts: [],
};

export default command;
