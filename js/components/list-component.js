import {InsertPosition, STATE_EMPTY, StateActions, Status, StatusLabel, Text} from '../constants.js';
import {renderElement, setElementVisibility} from '../utils.js';
import AbstractComponent from './abstract-component.js';
import BasketCleanerComponent from './basket-cleaner-component.js';
import EmptyItemComponent from './empty-item-component.js';
import TaskComponent from './task-component.js';

export default class ListComponent extends AbstractComponent {
  constructor(taskService, status) {
    super();
    this._taskService = taskService;
    this._status = status;
    this._title = StatusLabel[status];
    this._tasks = this._taskService.getByStatus(status);
    this._element = this.getElement();
  }

  _getTemplate() {
    return (
      `<article class="taskboard__group taskboard__group--${this._status}">
        <h3 class="taskboard__group-heading taskboard__group-heading--${this._status}">${this._title} ${this._tasks.length}</h3>
        <div class="taskboard__list" id="${this._status}"></div>
      </article>`
    );
  }

  _afterCreateElement() {
    this._makeListDroppable();
    this._addEventListeners();

    if (this._status === Status.BASKET) {
      const basketCleanerComponent = new BasketCleanerComponent(this._taskService);
      const basketCleanerElement = basketCleanerComponent.getElement();
      renderElement(this._element, basketCleanerElement, InsertPosition.BEFOREEND);
    }

    this._renderTasks();
  }

  _addEventListeners() {
    window.addEventListener(StateActions.TASK_CREATE, this._changeDataHandler.bind(this));
    window.addEventListener(StateActions.TASK_UPDATE_TITLE, this._changeDataHandler.bind(this));
    window.addEventListener(StateActions.TASK_UPDATE_POSITION, this._changeDataHandler.bind(this));
    window.addEventListener(StateActions.TASK_DELETE, this._changeDataHandler.bind(this));
    window.addEventListener(StateActions.TASK_UPDATE_STATUS, this._changeDataHandler.bind(this));
    window.addEventListener(StateActions.BASKET_CLEANUP, this._changeDataHandler.bind(this));
    window.addEventListener(StateActions.ELEMENT_DRAGOVER, this._elementDragoverHandler.bind(this));
  }

  _makeListDroppable() {
    const listElement = this._element.querySelector(`.taskboard__list`);

    if (listElement.id !== Status.EXPIRED) {
      listElement.addEventListener(`dragover`, this._dragoverHandler.bind(this, listElement));
    }
  }

  _renderTasks() {
    this._removeTasks();

    this._tasks.forEach((task) => {
      const taskItemComponent = new TaskComponent(this._taskService, task);
      const taskItemElement = taskItemComponent.getElement();

      renderElement(this._element.lastChild.previousElementSibling, taskItemElement, InsertPosition.BEFOREEND);
    });

    this._renderEmptyComponent(this._getEmptyComponentText(this._status));
  }

  _getEmptyComponentText(status) {
    switch(status) {
      case Status.BASKET:
        return Text.EMPTY_BASKET;
      case Status.EXPIRED:
        return Text.EMPTY_EXPIRED_BLOCK;
      default: 
        return Text.EMPTY_TASK;
    }
  }

  _extractStatus(element) {
    if (element.classList.contains(`task--backlog`)) {
      return Status.BACKLOG;
    } else if (element.classList.contains(`task--processing`)) {
      return Status.PROCESSING;
    } else if (element.classList.contains(`task--done`)) {
      return Status.DONE;
    } else if (element.classList.contains(`task--basket`)) {
      return Status.BASKET;
    } else if (element.classList.contains(`task--expired`)) {
      return Status.EXPIRED;
    }

    return Status.BACKLOG;
  }

  _removeTasks() {
    this._element.querySelector(`.taskboard__list`).innerHTML = ``;
  }

  _renderEmptyComponent(title) {
    const emptyItemComponent = new EmptyItemComponent(title, this._status, STATE_EMPTY);
    const emptyItemElement = emptyItemComponent.getElement();

    setElementVisibility(emptyItemElement, this._tasks.length === 0);
    renderElement(this._element.querySelector(`.taskboard__list`), emptyItemElement, InsertPosition.BEFOREEND);
  }

  _setTasksCount() {
    const element = this._element.querySelector(`.taskboard__group-heading--${this._status}`);
    element.innerText = `${this._title} ${this._tasks.length}`
  }

  _changeDataHandler() {
    this._tasks = this._taskService.getByStatus(this._status);
    this._setTasksCount();
    this._renderTasks();
  }

  _elementDragoverHandler() {
    const draggedElement = this._taskService.getDraggedElement();
    const draggedElementStatus = this._extractStatus(draggedElement);
    const isOneMovedElement = this._tasks.length === 1 && draggedElementStatus === this._status;

    if (isOneMovedElement) {
      const emptyElement = this._element.querySelector(`.task--${STATE_EMPTY}`);
      setElementVisibility(emptyElement, this._status !== draggedElement.dataset.status);
    }
  }

  _dragoverHandler(container, evt) {
    evt.preventDefault();

    const elementUnder = evt.target;
    const draggedElement = this._taskService.getDraggedElement();
    const isMovable = elementUnder.classList.contains(`task`) && elementUnder !== draggedElement;

    if (!isMovable) {
      return;
    }

    const referenceElement = elementUnder === draggedElement.nextElementSibling ? elementUnder.nextElementSibling : elementUnder;

    renderElement(container, draggedElement, InsertPosition.BEFOREBEGIN, referenceElement);
    draggedElement.dataset.status = this._extractStatus(elementUnder);
    this._taskService.elementDragover();
  }
}
