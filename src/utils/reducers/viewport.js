export default function viewportReducer(state = false, action) {
  switch (action.type) {
    case 'VIEWPORT_CHANGED':
      return action.payload;
    default:
      return state;
  }
}
