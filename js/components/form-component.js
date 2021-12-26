import {MIN_TITLE_LENGTH} from '../constants.js';
import {formatFormDate} from '../utils.js';
import AbstractComponent from './abstract-component.js';

export default class FormComponent extends AbstractComponent {
  constructor(taskService, label) {
    super();
    this._taskService = taskService;
    this._label = label;
    this._element = this.getElement();
  }

  _getTemplate() {
    return (
      `<form aria-label="Форма добавления задачи" class="add-task__form">
        <h1>${this._label}</h1>
        <div class="add-task__input-wrapper">
          <div class="add-task__form-block">
            <label for="add-task">Название</label>
            <input id="add-task" name="task-name" placeholder="Название задачи..." type="text" required minlength="${MIN_TITLE_LENGTH}">
          </div>
          <div class="add-task__form-block">
            <label for="set-deadline">Дедлайн</label>
            <input id="set-deadline" type="date" name="task-deadline" min=${formatFormDate(Date.now())} max="9999-12-31" value=${formatFormDate(Date.now())} required>
          </div>
        </div>
        <button class="add-task__button button" type="submit">
          <svg fill="none" height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg">
            <rect fill="white" height="14.6667" width="1.83333" x="10.0833" y="3.66663"/>
            <rect fill="white" height="14.6667" transform="rotate(90 18.3333 10.0833)" width="1.83333" x="18.3333" y="10.0833"/>
          </svg>
          <span>Добавить</span>
        </button>
      </form>`
    );
  }

  _afterCreateElement() {
    this._addEventListeners();
  }

  _addEventListeners() {
    const inputElement = this._element.querySelector(`#add-task`);

    inputElement.addEventListener(`input`, this._liveValidateTask.bind(this));
    this._element.addEventListener(`submit`, this.formSubmitHandler.bind(this));
  }

  _liveValidateTask(evt) {
    const title = evt.target.value;
    this._checkTask(title)
  }

  _checkTask(title) {
    const isTaskExist = this._taskService.getByTitle(title);

    if (isTaskExist) {
      this._setFormView(true);
      return false;
    }

    this._setFormView(false);
    return true;
  }

  _setFormView(formError) {
    return formError ? 
      this._element.classList.add(`add-task__form--error`) 
      : 
      this._element.classList.remove(`add-task__form--error`);
  }

  formSubmitHandler(evt) {
    evt.preventDefault();

    const inputElementTitle = this._element.querySelector(`#add-task`);
    const inputElementDeadline = this._element.querySelector(`#set-deadline`);
    const title = inputElementTitle.value.trim();
    const deadline = inputElementDeadline.value.trim();
    const taskValidationResult = this._checkTask(title);

    if (taskValidationResult) {
      this._taskService.create({title, deadline});
      inputElementTitle.value = ``;
      inputElementDeadline.value = formatFormDate(Date.now());
      return;
    }

    this._taskService.highlightTask(title);
  }
}

