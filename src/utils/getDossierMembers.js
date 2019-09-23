import store from './reduxStore';
import * as bungie from './bungie';
import * as responseUtils from './responseUtils';

export async function getDossierMembers(members) {

  let requestTime = + new Date();

  store.dispatch({
    type: 'DOSSIER_MEMBERS_LOADING',
    payload: {
      lastUpdated: requestTime
    }
  });

  let memberResponses = await Promise.all(
    members.map(async member => {
      try {
        const [profile, historicalStats] = await Promise.all([bungie.memberProfile(member.membershipType, member.membershipId, '100,104,200,202,204,205,300,301,302,303,304,305,306,800,900'), bungie.getHistoricalStats(member.membershipType, member.membershipId, '0', '1', '4,5,7,64', '0')]);
        member.profile = profile;
        member.historicalStats = historicalStats;
        
        if (!member.profile.characterProgressions.data) {
          member.error = 'privacy';
          return member;
        }
        member.profile = responseUtils.profileScrubber(member.profile, 'activity');

        return member;
      } catch (e) {
        member.profile = false;
        member.historicalStats = false;
        member.error = 'request';
        return member;
      }
    })
  );

  let currentStore = store.getState();

  if (currentStore.dossierMembers.lastUpdated === requestTime) {
    let payload = {
      responses: memberResponses
    }

    store.dispatch({
      type: 'DOSSIER_MEMBERS_LOADED',
      payload
    });
  }

  return true;
}

export default getDossierMembers;
