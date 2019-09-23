import * as ls from '../localStorage';

let lsState = ls.get('setting.tooltips') ? ls.get('setting.tooltips') : { detailedMode: false };

export default function themeReducer(state = lsState, action) {
  switch (action.type) {
    case 'SET_TOOLTIPS':
      ls.set('setting.tooltips', action.payload);
      return action.payload;
    default:
      return state;
  }
}
