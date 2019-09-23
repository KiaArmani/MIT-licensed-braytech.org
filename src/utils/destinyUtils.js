import React from 'react';
import orderBy from 'lodash/orderBy';

import manifest from './manifest';
import * as destinyEnums from './destinyEnums';

// TODO: we can just use itemCategoryHashes for this now?
export const isOrnament = item => item.inventory && item.inventory.stackUniqueLabel && item.plug && item.plug.plugCategoryIdentifier && item.plug.plugCategoryIdentifier.includes('skins');

export const flagEnum = (state, value) => !!(state & value);

export function hasCategoryHash(item, categoryHash) {
  return item.itemCategoryHashes && item.itemCategoryHashes.includes(categoryHash);
}

export function totalValor() {
  return Object.keys(manifest.DestinyProgressionDefinition[2626549951].steps).reduce((sum, key) => {
    return sum + manifest.DestinyProgressionDefinition[2626549951].steps[key].progressTotal;
  }, 0);
}

export function totalGlory() {
  return Object.keys(manifest.DestinyProgressionDefinition[2000925172].steps).reduce((sum, key) => {
    return sum + manifest.DestinyProgressionDefinition[2000925172].steps[key].progressTotal;
  }, 0);
}

export function totalInfamy() {
  return Object.keys(manifest.DestinyProgressionDefinition[2772425241].steps).reduce((sum, key) => {
    return sum + manifest.DestinyProgressionDefinition[2772425241].steps[key].progressTotal;
  }, 0);
}

export function collectionTotal(data) {
  if (!data.profileCollectibles || !data.characterCollectibles) {
    console.warn('No data provided to destinyUtils.collectionTotal');
    return '0';
  }

  let collectionTotal = 0;
  let profileTempCollections = {};

  for (const [hash, collectible] of Object.entries(data.profileCollectibles.data.collectibles)) {
    let collectibleState = destinyEnums.enumerateCollectibleState(collectible.state);
    if (!collectibleState.notAcquired) {
      if (!profileTempCollections[hash]) {
        profileTempCollections[hash] = 1;
      }
    }
  }

  for (const [characterId, character] of Object.entries(data.characterCollectibles.data)) {
    for (const [hash, collectible] of Object.entries(character.collectibles)) {
      let collectibleState = destinyEnums.enumerateCollectibleState(collectible.state);
      if (!collectibleState.notAcquired) {
        if (!profileTempCollections[hash]) {
          profileTempCollections[hash] = 1;
        }
      }
    }
  }

  for (const [hash, collectible] of Object.entries(profileTempCollections)) {
    collectionTotal++;
  }

  return collectionTotal;
}

export function genderTypeToString(str) {
  let string;

  switch (str) {
    case 0:
      string = 'Male';
      break;
    case 1:
      string = 'Female';
      break;
    default:
      string = 'uh oh';
  }

  return string;
}

export function groupMemberTypeToString(str) {
  let string;

  switch (str) {
    case 1:
      string = 'Beginner';
      break;
    case 2:
      string = 'Member';
      break;
    case 3:
      string = 'Admin';
      break;
    case 4:
      string = 'Acting Founder';
      break;
    case 5:
      string = 'Founder';
      break;
    default:
      string = 'None';
  }

  return string;
}

export function raceTypeToString(str) {
  let string;

  switch (str) {
    case 0:
      string = 'Human';
      break;
    case 1:
      string = 'Awoken';
      break;
    case 2:
      string = 'Exo';
      break;
    default:
      string = 'uh oh';
  }

  return string;
}

export function classHashToString(hash, gender) {
  let classDef = manifest.DestinyClassDefinition[hash];
  if (!classDef) return 'uh oh';
  if (classDef.genderedClassNames) {
    return classDef.genderedClassNames[gender === 1 ? 'Female' : 'Male'];
  }
  return classDef.displayProperties.name;
}

export function raceHashToString(hash, gender, nonGendered = false) {
  let raceDef = manifest.DestinyRaceDefinition[hash];
  if (!raceDef) return 'uh oh';
  if (raceDef.genderedRaceNames && !nonGendered) {
    return raceDef.genderedRaceNames[gender === 1 ? 'Female' : 'Male'];
  }
  return raceDef.displayProperties.name;
}

export function getDefName(hash, defType = 'DestinyInventoryItemDefinition') {
  try {
    return manifest[defType][hash].displayProperties.name;
  } catch (e) {}
  return 'uh oh';
}

export function classTypeToString(str) {
  let string;

  switch (str) {
    case 0:
      string = 'Titan';
      break;
    case 1:
      string = 'Hunter';
      break;
    case 2:
      string = 'Warlock';
      break;
    default:
      string = 'uh oh';
  }

  return string;
}

export function membershipTypeToString(str, short = false) {
  let string;

  if (short) {
    switch (str) {
      case 1:
        string = 'XB';
        break;
      case 2:
        string = 'PS';
        break;
      case 4:
        string = 'PC';
        break;
      default:
        string = '??';
    }
  } else {
    switch (str) {
      case 1:
        string = 'Xbox';
        break;
      case 2:
        string = 'PlayStation';
        break;
      case 4:
        string = 'PC';
        break;
      default:
        string = 'uh oh';
    }
  }

  return string;
}

export function damageTypeToString(type) {
  let string;

  switch (type) {
    case 3373582085:
      string = 'Kinetic';
      break;
    case 1847026933:
      string = 'Solar';
      break;
    case 2303181850:
      string = 'Arc';
      break;
    case 3454344768:
      string = 'Void';
      break;
    default:
      string = 'idk';
  }

  return string;
}

function getSubclassPath(gridDef, talentGrid) {
  let activatedNodes = talentGrid.nodes.filter(node => node.isActivated).map(node => node.nodeIndex);
  let selectedSkills = gridDef.nodeCategories.filter(category => {
    var overlapping = category.nodeHashes.filter(nodeHash => activatedNodes.indexOf(nodeHash) > -1);
    return overlapping.length > 0;
  });
  let subclassPath = selectedSkills.find(nodeDef => nodeDef.isLoreDriven);
  return subclassPath;
}

export function getSubclassPathInfo(profile, characterId) {
  const characters = profile.characters.data;
  const characterEquipment = profile.characterEquipment.data;
  const itemComponents = profile.itemComponents;

  const classTypes = { Titan: 0, Hunter: 1, Warlock: 2 };
  const damageTypes = { Arc: 2, Thermal: 3, Void: 4 };
  const identifiers = { First: 'FirstPath', Second: 'SecondPath', Third: 'ThirdPath' };

  const pathsCustomInfo = [
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Arc,
      identifier: identifiers.First,
      art: '01A3-0000112B'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Arc,
      identifier: identifiers.Second,
      art: '01A3-0000112B'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Arc,
      identifier: identifiers.Third,
      art: '01E3-00001598'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Thermal,
      identifier: identifiers.First,
      art: '01A3-0000116E'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Second,
      art: '01A3-0000116E'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Third,
      art: '01E3-0000159D'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Void,
      identifier: identifiers.First,
      art: '01A3-00001179'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Void,
      identifier: identifiers.Second,
      art: '01A3-00001179'
    },
    {
      classType: classTypes.Titan,
      damageType: damageTypes.Void,
      identifier: identifiers.Third,
      art: '01E3-0000159F'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Arc,
      identifier: identifiers.First,
      art: '01A3-000010B4'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Arc,
      identifier: identifiers.Second,
      art: '01A3-000010B4'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Arc,
      identifier: identifiers.Third,
      art: '01E3-00001593'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Thermal,
      identifier: identifiers.First,
      art: '01A3-000010F8'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Second,
      art: '01A3-000010F8'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Third,
      art: '01E3-00001595'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Void,
      identifier: identifiers.First,
      art: '01A3-00001107'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Void,
      identifier: identifiers.Second,
      art: '01A3-00001107'
    },
    {
      classType: classTypes.Hunter,
      damageType: damageTypes.Void,
      identifier: identifiers.Third,
      art: '01E3-00001596'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Arc,
      identifier: identifiers.First,
      art: '01A3-000011A1'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Arc,
      identifier: identifiers.Second,
      art: '01A3-000011A1'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Arc,
      identifier: identifiers.Third,
      art: '01E3-000015A1'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Thermal,
      identifier: identifiers.First,
      art: '01A3-000011F1'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Second,
      art: '01A3-000011F1'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Thermal,
      identifier: identifiers.Third,
      art: '01E3-000015A2'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Void,
      identifier: identifiers.First,
      art: '01A3-0000120D'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Void,
      identifier: identifiers.Second,
      art: '01A3-0000120D'
    },
    {
      classType: classTypes.Warlock,
      damageType: damageTypes.Void,
      identifier: identifiers.Third,
      art: '01E3-000015A5'
    }
  ];

  let equipment = characterEquipment[characterId].items;
  equipment = equipment.map(item => ({
    ...manifest.DestinyInventoryItemDefinition[item.itemHash],
    ...item,
    itemComponents: {
      perks: itemComponents.perks.data[item.itemInstanceId] ? itemComponents.perks.data[item.itemInstanceId].perks : null,
      objectives: itemComponents.objectives.data[item.itemInstanceId] ? itemComponents.objectives.data[item.itemInstanceId].objectives : null
    }
  }));

  let subclass = equipment.find(item => item.inventory.bucketTypeHash === 3284755031);
  let talentGrid = itemComponents.talentGrids.data[subclass.itemInstanceId];
  let gridDef = manifest.DestinyTalentGridDefinition[talentGrid.talentGridHash];
  let talentPath = getSubclassPath(gridDef, talentGrid);
  let damageNames = ['', '', 'arc', 'solar', 'void'];
  let damageType = subclass.talentGrid.hudDamageType;
  if (talentPath == null) {
    talentPath = { displayProperties: { name: 'Unknown' }, identifier: 'FirstPath' };
  }
  let pathCustom = pathsCustomInfo.find(p => p.classType === subclass.classType && p.damageType === damageType && p.identifier === talentPath.identifier);
  let path = {
    name: talentPath.displayProperties.name,
    element: damageNames[subclass.talentGrid.hudDamageType],
    art: pathCustom.art
  };

  return path;
}

export function ammoTypeToString(type) {
  let string;

  switch (type) {
    case 1:
      string = 'Primary';
      break;
    case 2:
      string = 'Special';
      break;
    case 3:
      string = 'Heavy';
      break;
    default:
      string = 'idk';
  }

  return string;
}

function stringToIconsWrapper(string) {
  return <span key={`icon-${string}`} className={`destiny-${string}`} />;
}

export function stringToIcons(string) {
  let array = [];

  let equivalents = {
    '[Sniper Rifle]': 'sniper_rifle',
    '[Headshot]': 'headshot',
    '[Auto Rifle]': 'auto_rifle',
    '[Pulse Rifle]': 'pulse_rifle',
    '[Scout Rifle]': 'scout_rifle',
    '[Hand Cannon]': 'hand_cannon',
    '[Sidearm]': 'sidearm',
    '[SMG]': 'smg',
    '[Shotgun]': 'shotgun',
    '[Fusion Rifle]': 'fusion_rifle',
    '[Linear Fusion Rifle]': 'wire_rifle',
    '[Trace Rifle]': 'beam_weapon',
    '[Rocker Launcher]': 'rocket_launcher',
    '[Sword]': 'sword_heavy',
    '[Grenade Launcher]': 'grenade_launcher',
    '[Bow]': 'bow',
    '[Machine Gun]': 'machinegun',
    '[Machine Gune]': 'machinegun'
  };

  array = string.split(/(\[.*?\])/g);

  array.forEach((part, index) => {
    let matches = part.match(/\[(.*?)\]/g);
    if (matches) {
      matches.forEach(match => {
        if (!equivalents[match]) {
          return;
        }
        array[index] = stringToIconsWrapper(equivalents[match]);
      });
    }
  });

  return array;
}

// thank you DIM (https://github.com/DestinyItemManager/DIM/blob/master/src/app/inventory/store/well-rested.ts)
export function isWellRested(characterProgression) {
  // We have to look at both the regular progress and the "legend" levels you gain after hitting the cap.
  // Thanks to expansions that raise the level cap, you may go back to earning regular XP after getting legend levels.
  const levelProgress = characterProgression.progressions[1716568313];
  const legendProgressDef = manifest.DestinyProgressionDefinition[2030054750];
  const legendProgress = characterProgression.progressions[2030054750];

  // You can only be well-rested if you've hit the normal level cap.
  // And if you haven't ever gained 3 legend levels, no dice.
  if (levelProgress.level < levelProgress.levelCap || legendProgress.level < 4) {
    return {
      wellRested: false
    };
  }

  const progress = legendProgress.weeklyProgress;

  const requiredXP = xpRequiredForLevel(legendProgress.level, legendProgressDef) + xpRequiredForLevel(legendProgress.level - 1, legendProgressDef) + xpRequiredForLevel(legendProgress.level - 2, legendProgressDef);

  // Have you gained XP equal to three full levels worth of XP?
  return {
    wellRested: progress < requiredXP,
    progress,
    requiredXP
  };
}

/**
 * How much XP was required to achieve the given level?
 */
function xpRequiredForLevel(level, progressDef) {
  const stepIndex = Math.min(Math.max(0, level), progressDef.steps.length - 1);
  return progressDef.steps[stepIndex].progressTotal;
}

export function lastPlayerActivity(member) {
  let lastActivity = false;
  let lastCharacter = false;
  let lastMode = false;
  let display = false;

  if (member.profile.characterActivities.data) {
    let lastCharacterActivity = Object.entries(member.profile.characterActivities.data);
    lastCharacterActivity = orderBy(lastCharacterActivity, [character => character[1].dateActivityStarted], ['desc']);
    lastCharacterActivity = lastCharacterActivity.length > 0 ? lastCharacterActivity[0] : false;

    let lastCharacterTime = Object.entries(member.profile.characterActivities.data);
    lastCharacterTime = orderBy(lastCharacterTime, [character => character[1].dateActivityStarted], ['desc']);

    let lastCharacterId = lastCharacterActivity ? lastCharacterActivity[0] : lastCharacterTime[0];
    lastActivity = lastCharacterActivity ? lastCharacterActivity[1] : false;

    lastCharacter = member.profile.characters.data.find(character => character.characterId === lastCharacterId);

    if (lastActivity && member.isOnline !== false) {
      let activity = manifest.DestinyActivityDefinition[lastActivity.currentActivityHash];
      let mode = activity ? (activity.placeHash === 2961497387 ? false : manifest.DestinyActivityModeDefinition[lastActivity.currentActivityModeHash]) : false;

      if (mode) {
        display = `${mode.displayProperties.name}: ${activity.displayProperties.name}`;
      } else if (activity) {
        if (activity.placeHash === 2961497387) {
          display = `Orbit`;
        } else {
          display = activity.displayProperties.name;
        }
      } else {
        display = false;
      }

      if ((mode && mode.parentHashes.length) || (activity && activity.placeHash === 2961497387)) {
        lastMode =
          activity.placeHash === 2961497387
            ? {
                displayProperties: {
                  name: 'Orbit'
                }
              }
            : manifest.DestinyActivityModeDefinition[mode.parentHashes[0]];
      }
    }
  } else {
  }

  return {
    lastPlayed: lastActivity ? lastActivity.dateActivityStarted : member.profile.profile.data.dateLastPlayed,
    lastCharacter,
    lastActivity,
    lastMode,
    display
  };
}
