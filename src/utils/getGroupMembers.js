import store from './reduxStore';
import * as bungie from './bungie';
import * as responseUtils from './responseUtils';

export async function getGroupMembers(group) {
  store.dispatch({
    type: 'GROUP_MEMBERS_LOADING'
  });

  const groupMembersResponse = await bungie.groupMembers(group.groupId);

  let memberResponses = await Promise.all(
    groupMembersResponse.results.map(async member => {
      try {
        const [profile, historicalStats] = await Promise.all([bungie.memberProfile(member.destinyUserInfo.membershipType, member.destinyUserInfo.membershipId, '100,200,202,204,900'), bungie.getHistoricalStats(member.destinyUserInfo.membershipType, member.destinyUserInfo.membershipId, '0', '1', '4,5,7,64', '0')]);
        member.profile = profile;
        member.historicalStats = historicalStats;
        
        if (!member.profile.characterProgressions.data) {
          return member;
        }
        member.profile = responseUtils.profileScrubber(member.profile);

        return member;
      } catch (e) {
        member.profile = false;
        member.historicalStats = false;
        return member;
      }
    })
  );

  let payload = {
    groupId: group.groupId,
    responses: memberResponses,
    lastUpdated: + new Date()
  }

  store.dispatch({
    type: 'GROUP_MEMBERS_LOADED',
    payload
  });

  return true;
}

export default getGroupMembers;
