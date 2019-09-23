import store from './reduxStore';
import * as bungie from './bungie';

export async function getPGCR(membershipId, id) {
  store.dispatch({ type: 'PGCR_LOADING' });

  let response = await bungie.PGCR(id);
  response.instanceId = id;
  
  store.dispatch({ type: 'PGCR_LOADED', payload: { membershipId, response } });

  return true;
}

export default getPGCR;
