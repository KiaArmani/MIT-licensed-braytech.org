import * as ls from '../localStorage';

// const defaultState = ls.get('setting.refreshService')
//   ? ls.get('setting.refreshService')
//   : {
//       config: {
//         enabled: true,
//         frequency: 30
//       }
//     };
const defaultState = {
  config: {
    enabled: true,
    frequency: 30
  }
};

export default function profileReducer(state = defaultState, action) {
  switch (action.type) {
    case 'SET_REFRESH_OPTIONS':
      ls.set('setting.refreshService', {
        ...state,
        ...action.payload
      });
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}
