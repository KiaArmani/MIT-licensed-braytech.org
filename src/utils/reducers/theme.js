import * as ls from '../localStorage';

let lsState = ls.get('setting.theme') ? ls.get('setting.theme') : false;
lsState = lsState && lsState.selected ? lsState : { selected: 'light-mode' };

export default function themeReducer(state = lsState, action) {
  switch (action.type) {
    case 'SET_THEME':
      ls.set('setting.theme', {
        selected: action.payload
      });
      return {
        selected: action.payload
      };
    default:
      return state;
  }
}
