import React from 'react';
import { EditorPrivateContextProps, withEditorPrivateContext } from '../../common/context/EditorPrivateContext';
import pick from 'lodash/pick';
import { Shape } from 'src/common/interface';

interface ItemProps extends EditorPrivateContextProps {
  /** 预览图资源 */
  src: string;
}

interface ItemState {
  /** 隐藏的用于拖拽的DOM节点 */
  shadowShape: null | Element;
  /** 在画布上的节点拖拽过程中的代理图形 */
  dragShape: null | Shape;
  /** 画布上代理图形的id（常量） */
  dragShapeID: 'temp_drag_node';
}

class Item extends React.PureComponent<ItemProps, ItemState> {
  constructor(props) {
    super(props);
    this.state = {
      shadowShape: null,
      dragShape: null,
      dragShapeID: 'temp_drag_node',
    };
  }

  handleMouseDown = (ev: MouseEvent) => {
    const shadowShape = this.createShadowShape(ev);
    document.body.appendChild(shadowShape);
    this.setState({
      shadowShape,
    });
  };

  handleMouseUp = () => {
    this.unloadDragShape();
  };

  createShadowShape(ev: MouseEvent) {
    const { src } = this.props;

    const Img = document.createElement('img');
    Img.src = src;
    const shadowShape = document.createElement('div');
    const styleObj = `
      width: ${Img.width}px;
      height: ${Img.height}px;
      position: fixed;
      opacity: 0;
      top: ${ev.clientY - Img.height / 2}px;
      left: ${ev.clientX - Img.width / 2}px;
      cursor: pointer;
      z-index:99999;
    `;

    shadowShape.setAttribute('style', styleObj);
    shadowShape.setAttribute('draggable', 'true');
    shadowShape.addEventListener('drag', this.handleDrag, false);
    document.addEventListener('dragover', this.handleDragover, false);
    document.addEventListener('dragenter', this.handleDragenter, false);
    document.addEventListener('drop', this.handleDrop, false);
    shadowShape.addEventListener('mouseup', this.handleMouseUp, false);
    return shadowShape;
  }

  handleDragover = ev => {
    ev.preventDefault();
  };

  handleDragenter = ev => {
    const { graph } = this.props;
    const transferredPos = graph.getPointByClient(ev.clientX, ev.clientY);

    const canvas = graph.get('container').getElementsByTagName('canvas')[0];
    // drag into canvas
    if (ev.target.id === canvas.id) {
      this.loadDragShape(transferredPos);
    }
  };

  handleDrag = ev => {
    const { graph } = this.props;
    const { dragShape, dragShapeID } = this.state;
    if (dragShape) {
      const transferredPos = graph.getPointByClient(ev.clientX, ev.clientY);
      graph.update(dragShapeID, {
        ...transferredPos,
      });
    }
  };

  loadDragShape({ x, y }) {
    const { graph } = this.props;
    const { dragShape, shadowShape, dragShapeID } = this.state;
    if (!dragShape) {
      const newDragShape: Shape = graph.add('node', {
        shape: 'rect',
        x,
        y,
        size: [shadowShape.offsetWidth, shadowShape.offsetHeight],
        style: {
          fill: '#F3F9FF',
          fillOpacity: 0.5,
          stroke: '#1890FF',
          strokeOpacity: 0.9,
          lineDash: [5, 5],
        },
        id: dragShapeID,
      });
      this.setState({
        dragShape: newDragShape,
      });
    }
  }

  unloadDragShape() {
    const { graph } = this.props;
    const { dragShape, shadowShape } = this.state;

    if (dragShape) {
      graph.remove(dragShape);
    }
    if (shadowShape) {
      document.body.removeChild(shadowShape);
    }
    this.setState({
      dragShape: null,
      shadowShape: null,
    });
    document.removeEventListener('dragenter', this.handleDragenter);
    document.removeEventListener('dragover', this.handleDragover);
    document.removeEventListener('drop', this.handleDrop);
  }

  handleDrop = ev => {
    const { graph, executeCommand, type, model, shape, size } = this.props;
    const { dragShapeID } = this.state;

    const canvas = graph.get('container').getElementsByTagName('canvas')[0];
    const transferredPos = graph.getPointByClient(ev.clientX, ev.clientY);

    // drag into canvas
    if (ev.target.id === canvas.id) {
      executeCommand('add', {
        type,
        model: {
          ...model,
          shape,
          ...transferredPos,
          size: size.split('*'),
        },
      });
    }
    this.unloadDragShape();
    graph.remove(dragShapeID);
  };

  render() {
    const { src, shape, children } = this.props;

    return (
      <div
        style={{ cursor: 'pointer' }}
        onMouseDown={this.handleMouseDown}
        {...pick(this.props, ['style', 'className'])}
      >
        {src ? <img src={src} alt={shape} draggable={false} /> : children}
      </div>
    );
  }
}

export default withEditorPrivateContext<ItemProps>(Item);
