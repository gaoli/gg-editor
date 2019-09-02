import { ItemModel } from '../../../common/interface';
import commandManager from '../../../common/commandManager';
import { BaseCommand } from '../../Graph/command/base';
import { topicCommand } from './topic';

interface SubtopicCommandParams {
  id: string;
  model: ItemModel;
}

const subtopicCommand: BaseCommand<SubtopicCommandParams> = {
  ...topicCommand,

  canExecute(graph) {
    return this.getSelectedNodes(graph)[0] ? true : false;
  },

  execute(graph) {
    const { id, model } = this.params;

    const parent = graph.findById(id);

    graph.addChild(model, parent);

    this.setSelectedNode(graph, model.id);
  },

  shortcuts: ['Tab'],
};

commandManager.register('subtopic', subtopicCommand);
