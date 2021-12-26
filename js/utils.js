import {HIDE_BLOCK_CLASS, InsertPosition} from './constants.js';

export function createElement(template) {
  const element = document.createElement(`div`);
  element.innerHTML = template;

  return element.firstElementChild;
}

export function renderElement(container, element, insertPosition = InsertPosition.BEFOREEND, referenceElement = undefined) {
  switch (insertPosition) {
    case (InsertPosition.BEFOREEND):
      container.append(element);
      break;
    case (InsertPosition.AFTERBEGIN):
      container.prepend(element);
      break;
    case (InsertPosition.BEFOREBEGIN):
      container.insertBefore(element, referenceElement);
      break;
  }
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function setElementVisibility(element, visibility) {
  element.classList.toggle(HIDE_BLOCK_CLASS, !visibility)
}

export function formatTaskDate(date) {
  return moment(date).format(`DD.MM.YYYY`);
}

export function formatFormDate(date) {
  return moment(date).add(1, `day`).format(`YYYY-MM-DD`);
}

export function countDaysRemain(date) {

  if (moment(date).isSame(moment(), 'day')) {
    return 0;
  }

  if (moment(date).isBefore(moment(), 'day')) {
    return moment(date).diff(moment(), 'day');
  }

  return moment(date).diff(moment(), 'day') + 1;
}

export function setDeadlineStatus(daysLeft) {
  if (daysLeft === 0) return `task__days-left--danger`;
  if (daysLeft < 0) return `task__days-left--alarm`;
  if (daysLeft < 5) return `task__days-left--warning`;
  return `task__days-left--ok`;
}

export function getRandomIntRange(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function setDeadline(start, end) {
  return moment().add(getRandomIntRange(start, end), `day`).format(`YYYY-MM-DD`);
}
