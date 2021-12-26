import {setDeadline} from './utils.js';

export const tasks = [
  
  {
    'id': `2`,
    'title': `Выучить React`,
    'status': `backlog`,
    'deadline': setDeadline(5, 30)
  },
  {
    'id': `3`,
    'title': `Позвонить другу`,
    'status': `done`,
    'deadline': setDeadline(5, 30)
  },
  {
    'id': `4`,
    'title': `Выпить водочки`,
    'status': `processing`,
    'deadline': setDeadline(5, 30)
  },
  {
    'id': `5`,
    'title': `Сходить погулять`,
    'status': `basket`,
    'deadline': setDeadline(5, 30)
  },
  {
    'id': `6`,
    'title': `Перестать тупить`,
    'status': `processing`,
    'deadline': setDeadline(5, 30)
  },
  {
    'id': `7`,
    'title': `Запилить проект`,
    'status': `backlog`,
    'deadline': setDeadline(1, 3)
  },
  {
    'id': `8`,
    'title': `Прочитать мануал`,
    'status': `basket`,
    'deadline': setDeadline(1, 5)
  },
  {
    'id': `9`,
    'title': `Погладить кота`,
    'status': `done`,
    'deadline': setDeadline(0, 0)
  },
  {
    'id': `1`,
    'title': `Выучить JS`,
    'status': `backlog`,
    'deadline': `2020-11-04`
  },
];
