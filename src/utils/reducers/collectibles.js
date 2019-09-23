import * as ls from '../localStorage';

const savedState = ls.get('setting.collectibleDisplayState') ? ls.get('setting.collectibleDisplayState') : {};
const defaultState = {
  hideTriumphRecords: false,
  hideChecklistItems: false,
  hideInvisibleCollectibles: true,
  ...savedState
};

export default function collectiblesReducer(state = defaultState, action) {
  switch (action.type) {
    case 'SET_COLLECTIBLES':
      ls.set('setting.collectibleDisplayState', action.payload);
      return action.payload;
    default:
      return state;
  }
}
