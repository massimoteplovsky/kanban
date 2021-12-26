import {StateActions, Status} from '../constants.js';
import {generateId, countDaysRemain} from '../utils.js';

export default class TasksService {
  constructor(tasks) {
    this._tasks = tasks;
    this._findExpiredTasks(this._tasks);
  }

  _findExpiredTasks(tasks) {
    tasks.map((task) => countDaysRemain(task.deadline) < 0 ? task.status = Status.EXPIRED : task);
  }

  create(task) {
    task.id = generateId();
    task.status = Status.BACKLOG;
    this._tasks.push(task);

    this._emitEvent(StateActions.TASK_CREATE, task);
  }

  updateTitle(task) {
    const taskIndex = this._getTaskIndexByID(task.id);

    if (taskIndex !== -1) {
      this._tasks.splice(taskIndex, 1, task);
      this._emitEvent(StateActions.TASK_UPDATE_TITLE, task);
    }
  }

  deleteTask(taskId) {
    this._tasks = this._tasks.filter((task) => task.id !== taskId);
    this._emitEvent(StateActions.TASK_DELETE);
  }

  highlightTask(taskTitle) {
    const task = this.getByTitle(taskTitle);
    this._emitEvent(StateActions.TASK_HIGHLIGHT, task);
  }

  updatePosition(task, prevTaskId) {
    const taskIndex = this._getTaskIndexByID(task.id);
    this._tasks.splice(taskIndex, 1);

    if (prevTaskId !== undefined) {
      const prevTaskIndex = this._tasks.findIndex((el) => el.id === prevTaskId);
      this._tasks.splice(prevTaskIndex + 1, 0, task);
    } else {
      this._tasks.unshift(task);
    }

    this._emitEvent(StateActions.TASK_UPDATE_POSITION, task);
  }

  cleanupBasket() {
    this._tasks = this._tasks.filter((task) => task.status !== Status.BASKET);
    this._emitEvent(StateActions.BASKET_CLEANUP);
  }

  getByStatus(status) {
    return this._tasks.filter((task) => task.status === status);
  }

  getByTitle(title) {
    return this._tasks.find((task) => task.title === title);
  }

  _getById(id) {
    return this._tasks.find((task) => task.id === id);
  }

  elementDragover() {
    this._emitEvent(StateActions.ELEMENT_DRAGOVER);
  }

  changeTaskStatus(taskId, newStatus) {
    const task = this._getById(taskId);
    task.status = newStatus;
    this._emitEvent(StateActions.TASK_UPDATE_STATUS);
  }

  startTaskEditing(task = {}) {
    this._emitEvent(StateActions.ELEMENT_EDITED, task);
  }

  setDraggedElement(taskElement) {
    this._draggedElement = taskElement;
  }

  getDraggedElement() {
    return this._draggedElement;
  }

  _emitEvent(type, detail) {
    window.dispatchEvent(new CustomEvent(type, {detail}));
  }

  _getTaskIndexByID(id) {
    return this._tasks.findIndex((el) => el.id === id);
  }
}
