import * as responseUtils from './responseUtils';
import * as bungie from './bungie';

async function getMember(membershipType, membershipId) {
  let [profile, groups, milestones] = await Promise.all([bungie.memberProfile(membershipType, membershipId, '100,104,200,202,204,205,300,301,302,303,304,305,306,800,900'), bungie.memberGroups(membershipType, membershipId), bungie.milestones()]);
  // let [profile, groups, historicalStats, milestones] = await Promise.all([bungie.memberProfile(membershipType, membershipId, '100,104,200,202,204,205,300,301,302,303,304,305,800,900'), bungie.memberGroups(membershipType, membershipId), bungie.getHistoricalStats(membershipType, membershipId, '0', '1,3', '16,17,18,46,47', '0'), bungie.milestones()]);

  try {
    profile = responseUtils.profileScrubber(profile);
    groups = responseUtils.groupScrubber(groups);
  } catch (e) {

  }

  return {
    profile,
    groups,
    milestones
  };
}

export default getMember;
