// Bungie API access convenience methods
import { Globals } from './globals';

class BungieError extends Error {
  constructor(request) {
    super(request.Message);

    this.errorCode = request.ErrorCode;
    this.errorStatus = request.ErrorStatus;
  }
}

async function apiRequest(path, stats = false) {
  const options = { headers: { 'X-API-Key': Globals.key.bungie } };

  const request = await fetch(`https://${stats ? 'stats' : 'www'}.bungie.net${path}`, options).then(r => r.json());

  if (request.ErrorCode !== 1) {
    throw new BungieError(request);
  }

  return request.Response;
}

export const manifestIndex = async () => apiRequest('/Platform/Destiny2/Manifest/');

export const settings = async () => apiRequest(`/Platform/Settings/`);

export const milestones = async () => apiRequest('/Platform/Destiny2/Milestones/');

export const manifest = async version => fetch(`https://www.bungie.net${version}`).then(a => a.json());

export const memberProfile = async (membershipType, membershipId, components) => apiRequest(`/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`);

export const memberGroups = async (membershipType, membershipId) => apiRequest(`/Platform/GroupV2/User/${membershipType}/${membershipId}/0/1/`);

export const GetGroupByName = async (groupName, groupType = 1) => apiRequest(`/Platform/GroupV2/Name/${groupName}/${groupType}/`);

export const groupMembers = async groupId => apiRequest(`/Platform/GroupV2/${groupId}/Members/`);

export const group = async groupId => apiRequest(`/Platform/GroupV2/${groupId}/`);

export const groupWeeklyRewardState = async groupId => apiRequest(`/Platform/Destiny2/Clan/${groupId}/WeeklyRewardState/`);

export const getHistoricalStats = async (membershipType, membershipId, characterId = '0', groups, modes, periodType) => apiRequest(`/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/0/Stats/?groups=${groups}&modes=${modes}&periodType=${periodType}`);

export const playerSearch = async (membershipType, displayName) => apiRequest(`/Platform/Destiny2/SearchDestinyPlayer/${membershipType}/${encodeURIComponent(displayName)}/`);

export const activityHistory = async (membershipType, membershipId, characterId, count, mode = false, page) => apiRequest(`/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?page=${page}${mode ? `&mode=${mode}` : ''}&count=${count}`);

export const PGCR = async id => apiRequest(`/Platform/Destiny2/Stats/PostGameCarnageReport/${id}/`, true);