import AddTaskComponent from './components/add-task-component.js';
import BoardComponent from './components/board-component.js';
import HeaderComponent from './components/header-component.js';
import {InsertPosition} from './constants.js';
import {tasks} from './data.js';
import TasksService from './services/task-service.js';
import {renderElement} from './utils.js';

export default class App {
  constructor() {
    this._bodyElement = document.querySelector(`body.board-app`);
    this._boardAppInnerElement = document.querySelector(`main > div.board-app__inner`);
    this._taskService = new TasksService(tasks);
  }

  init(name) {
    const headerComponent = new HeaderComponent(name);
    const headerElement = headerComponent.getElement();

    const addTaskComponent = new AddTaskComponent(this._taskService);
    const addTaskElement = addTaskComponent.getElement();

    const boardComponent = new BoardComponent(this._taskService);
    const boardElement = boardComponent.getElement();

    renderElement(this._bodyElement, headerElement, InsertPosition.AFTERBEGIN);
    renderElement(this._boardAppInnerElement, addTaskElement, InsertPosition.AFTERBEGIN);
    renderElement(this._boardAppInnerElement, boardElement, InsertPosition.BEFOREEND);
  }
}
