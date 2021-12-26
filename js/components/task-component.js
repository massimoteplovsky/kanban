import {Key, StateActions, Status, StatusLabel} from '../constants.js';
import {setElementVisibility, formatTaskDate, countDaysRemain, setDeadlineStatus} from '../utils.js';
import AbstractComponent from './abstract-component.js';

export default class TaskComponent extends AbstractComponent {
  constructor(taskService, task) {
    super();
    this._taskService = taskService;
    this._task = {...task};
    this._updateError = false;
    this._isExpiredTask = this._task.status === Status.EXPIRED;
    this._element = this.getElement();
  }

  _getTemplate() {
    return (
      `<div class="taskboard__item task task--${this._task.status}" data-id="${this._task.id}">
        <div class="task__body">
          <p class="task--deadline">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" enable-background="new 0 0 512 512" height="12" viewBox="0 0 512 512" width="12"><g><path d="m446 40h-46v-24c0-8.836-7.163-16-16-16s-16 7.164-16 16v24h-224v-24c0-8.836-7.163-16-16-16s-16 7.164-16 16v24h-46c-36.393 0-66 29.607-66 66v340c0 36.393 29.607 66 66 66h380c36.393 0 66-29.607 66-66v-340c0-36.393-29.607-66-66-66zm-380 32h46v16c0 8.836 7.163 16 16 16s16-7.164 16-16v-16h224v16c0 8.836 7.163 16 16 16s16-7.164 16-16v-16h46c18.748 0 34 15.252 34 34v38h-448v-38c0-18.748 15.252-34 34-34zm380 408h-380c-18.748 0-34-15.252-34-34v-270h448v270c0 18.748-15.252 34-34 34z"/></g></svg>
              ${formatTaskDate(this._task.deadline)}
            </span>
            <span class="task__days-left ${setDeadlineStatus(countDaysRemain(this._task.deadline))}">
              <svg xmlns="http://www.w3.org/2000/svg" id="Capa_1" enable-background="new 0 0 512 512" height="12" viewBox="0 0 512 512" width="12"><path d="m450.201 407.453c-1.505-.977-12.832-8.912-24.174-32.917-20.829-44.082-25.201-106.18-25.201-150.511 0-.193-.004-.384-.011-.576-.227-58.589-35.31-109.095-85.514-131.756v-34.657c0-31.45-25.544-57.036-56.942-57.036h-4.719c-31.398 0-56.942 25.586-56.942 57.036v34.655c-50.372 22.734-85.525 73.498-85.525 132.334 0 44.331-4.372 106.428-25.201 150.511-11.341 24.004-22.668 31.939-24.174 32.917-6.342 2.935-9.469 9.715-8.01 16.586 1.473 6.939 7.959 11.723 15.042 11.723h109.947c.614 42.141 35.008 76.238 77.223 76.238s76.609-34.097 77.223-76.238h109.947c7.082 0 13.569-4.784 15.042-11.723 1.457-6.871-1.669-13.652-8.011-16.586zm-223.502-350.417c0-14.881 12.086-26.987 26.942-26.987h4.719c14.856 0 26.942 12.106 26.942 26.987v24.917c-9.468-1.957-19.269-2.987-29.306-2.987-10.034 0-19.832 1.029-29.296 2.984v-24.914zm29.301 424.915c-25.673 0-46.614-20.617-47.223-46.188h94.445c-.608 25.57-21.549 46.188-47.222 46.188zm60.4-76.239c-.003 0-213.385 0-213.385 0 2.595-4.044 5.236-8.623 7.861-13.798 20.104-39.643 30.298-96.129 30.298-167.889 0-63.417 51.509-115.01 114.821-115.01s114.821 51.593 114.821 115.06c0 .185.003.369.01.553.057 71.472 10.25 127.755 30.298 167.286 2.625 5.176 5.267 9.754 7.861 13.798z"/></svg>
              ${countDaysRemain(this._task.deadline)}
            </span>
          </p>
          <p class="task--view">${this._task.title}</p>
          <input type="text" class="task--input"/>
          <select class="task--status">
            ${
              Object.values(Status).map((status) => {
                if (status !== Status.EXPIRED && status !== this._task.status) {
                  return `<option value=${status} ${this._task.status === status ? "selected" : ""}>${StatusLabel[status]}</option>`
                }
              }).join("")
            }
          </select>
        </div>
        ${
          this._isExpiredTask ? 
            `<button aria-label="Удалить" class="task__delete" type="button"></button>`
            :
            `<button aria-label="Изменить" class="task__edit" type="button"></button>`
        }
      </div>`
    );
  }

  _afterCreateElement() {
    if (!this._isExpiredTask) {
      this._makeTaskEditable();
      this._makeTaskDraggable();
    }
    this._addEventListeners();
  }

  _addEventListeners() {
    const taskInputElement = this._element.querySelector(`.task--input`);
    const taskSelectElement = this._element.querySelector(`.task--status`);
    const taskDeleteBtn = this._element.querySelector(`.task__delete`);

    window.addEventListener(StateActions.ELEMENT_EDITED, ({detail}) => {
      if (!this._isExpiredTask) {
        const isDisplayBlock = detail.id === undefined || detail.id === this._task.id;
        setElementVisibility(this._element.querySelector(`.task__edit`), isDisplayBlock);
      }
    });

    window.addEventListener(StateActions.TASK_HIGHLIGHT, ({detail}) => {
      if (detail.id === this._task.id) {
        this._highlightTask();
      }
    });

    taskInputElement.addEventListener(`input`, this._liveValidationTask.bind(this));
    taskSelectElement.addEventListener(`change`, this._changeStatusHandler.bind(this));
    if (this._isExpiredTask) {
      taskDeleteBtn.addEventListener(`click`, this._deleteTaskHandler.bind(this, this._task.id))
    }  
  }

  _deleteTaskHandler(taskId) {
    this._taskService.deleteTask(taskId);
  }

  _changeStatusHandler(evt) {
    const newStatus = evt.target.value;

    if (this._task.status !== newStatus) {
      this._taskService.changeTaskStatus(this._task.id, newStatus);
    }
  }

  _highlightTask() {
    this._element.classList.add(`task--highlight`);
    setTimeout(() => this._element.classList.remove(`task--highlight`), 2000);
  }

  _updateValidation() {
    const taskInputElement = this._element.querySelector(`.task--input`);

    if (this._element.classList.contains(`task--active`)) {
      this._saveTask(taskInputElement.value);

      if (this._updateError) {
        this._setTaskViewMode(false);
        this._taskService.highlightTask(taskInputElement.value);
      } else {
        this._setTaskViewMode();
      }
    } else {
      this._setTaskViewMode(false);
      taskInputElement.value = this._task.title;
    }
  }

  _makeTaskEditable() {
    const taskEditElement = this._element.querySelector(`.task__edit`);
    const taskTitleElement = this._element.querySelector(`.task--view`);

    taskEditElement.addEventListener(`click`, this._updateValidation.bind(this));

    this._element.addEventListener(`keydown`, (evt) => {
      if (evt.keyCode === Key.ENTER && evt.shiftKey === false && evt.ctrlKey === false && evt.altKey === false) {
        this._updateValidation();
      } else if (evt.keyCode === Key.ESCAPE) {
        this._setTaskViewMode();
        this._updateError = false;
        taskTitleElement.innerText = this._task.title;
      }
    });
  }

  _liveValidationTask(evt) {
    const newTitle = evt.target.value;
    const task = this._taskService.getByTitle(newTitle);
    
    if (task && task.title !== this._task.title) {
      this._element.classList.add(`task--active-error`); 
    } else {
      this._element.classList.remove(`task--active-error`);
    }
  }

  _saveTask(newTitle) {
    if (this._task.title !== newTitle && newTitle.length > 2) {
      const isTaskExist = this._taskService.getByTitle(newTitle);

      if (!isTaskExist) {
        this._updateError = false;
        this._task.title = newTitle;
        this._taskService.updateTitle(this._task);
      } else {
        this._updateError = true;
        this._element.classList.add(`task--active-error`); 
      }
    } else {
      this._updateError = false;
    }
  }

  _setTaskViewMode(viewMode = true) {
    const taskInputElement = this._element.querySelector(`.task--input`);

    if (viewMode) {
      this._element.classList.remove(`task--active`, `task--active-error`);
      this._taskService.startTaskEditing();
      taskInputElement.blur();
    } else {
      this._element.classList.add(`task--active`); 
      this._taskService.startTaskEditing(this._task);
      taskInputElement.focus();
    }
  }

  _makeTaskDraggable() {
    this._taskService.setDraggedElement(null);

    this._element.setAttribute(`draggable`, true);
    this._element.addEventListener(`dragstart`, this._dragstartHandler.bind(this));
    this._element.addEventListener(`dragend`, this._dragendHandler.bind(this));
  }

  _dragstartHandler() {
    const draggedElement = this._element;
    draggedElement.classList.add(`task--dragged`);
    this._taskService.setDraggedElement(draggedElement);
  }

  _dragendHandler() {
    const prevTaskId = this._element.previousElementSibling ? this._element.previousElementSibling.dataset.id : undefined;
    const draggedElement = this._taskService.getDraggedElement();

    draggedElement.classList.remove(`task--dragged`);
 
    if (draggedElement.dataset.status) {
      this._task.status = draggedElement.dataset.status;
      this._taskService.updatePosition(this._task, prevTaskId);
    }
    this._taskService.setDraggedElement(null);
  }

}
