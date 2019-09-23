import sortBy from 'lodash/sortBy';
import find from 'lodash/find';

import React from 'react';

import Checklist from './Checklist';
import ChecklistItem from './ChecklistItem';
import mappings from '../../data/mappings';
import manifest from '../../utils/manifest';

// For when the mappings generated from lowlines' data don't have a
// bubbleHash but do have a bubbleId. Inferred by cross-referencing
// with https://docs.google.com/spreadsheets/d/1qgZtT1qbUFjyV8-ni73m6UCHTcuLmuLBx-zn_B7NFkY/edit#gid=1808601275
const manualBubbleNames = {
  default: 'The Farm',
  'high-plains': 'High Plains',
  erebus: 'The Shattered Throne',
  descent: 'The Shattered Throne',
  eleusinia: 'The Shattered Throne',
  'cimmerian-garrison': 'Cimmerian Garrison',
  'shattered-ruins': 'Shattered Ruins',
  'agonarch-abyss': 'Agonarch Abyss',
  'keep-of-honed-edges': 'Keep of Honed Edges',
  ouroborea: 'Ouroborea',
  'forfeit-shrine': 'Forfeit Shrine',
  adytum: 'The Corrupted',
  'queens-court': 'The Queens Court',
  'ascendant-plane': 'Dark Monastery'
};

// Anything here gets merged in to created items - use it when you need to
// override something in item()
const itemOverrides = {
  // Brephos II is listed as Temple of Illyn, but it's only available
  // during the strike, so hardcode it here to be consistent with the other
  // strike item.
  1370818869: {
    bubble: 'The Corrupted'
  }
};

class ChecklistFactoryHelpers {
  constructor(t, profile, characterId, hideCompletedItems) {
    this.t = t;
    this.profile = profile;
    this.characterId = characterId;
    this.hideCompletedItems = hideCompletedItems;
  }

  checklistItems(checklistId, isCharacterBound) {
    const progressionSource = isCharacterBound ? this.profile.characterProgressions.data[this.characterId] : this.profile.profileProgression.data;
    const progression = progressionSource.checklists[checklistId];
    const checklist = manifest.DestinyChecklistDefinition[checklistId];

    return Object.entries(progression).map(([id, completed]) => {
      const item = find(checklist.entries, { hash: parseInt(id) });

      return this.checklistItem(item, completed);
    });
  }

  checklistItem(item, completed) {
    const mapping = mappings.checklists[item.hash] || {};

    const destinationHash = item.destinationHash || mapping.destinationHash;
    const bubbleHash = item.bubbleHash || mapping.bubbleHash;

    // Try to find the destination, place and bubble by the hashes if we have them
    const destination = destinationHash && manifest.DestinyDestinationDefinition[destinationHash];
    const place = destination && manifest.DestinyPlaceDefinition[destination.placeHash];
    const bubble = bubbleHash && find(destination.bubbles, { hash: bubbleHash });

    // If the item has a name with a number in it, extract it so we can use it later
    // for sorting & display
    const numberMatch = item.displayProperties.name.match(/([0-9]+)/);
    const itemNumber = numberMatch && numberMatch[0];

    // Discover things needed only for adventures & sleeper nodes & bones
    const activity = item.activityHash && manifest.DestinyActivityDefinition[item.activityHash];
    const inventoryItem = manifest.DestinyInventoryItemDefinition[item.itemHash];
    const record = mapping.recordHash && manifest.DestinyRecordDefinition[mapping.recordHash];
    const lore = record && manifest.DestinyLoreDefinition[record.loreHash];

    // If we don't have a bubble, see if we can infer one from the bubble ID
    let bubbleName = (bubble && bubble.displayProperties.name) || (mapping.bubbleId && manualBubbleNames[mapping.bubbleId]) || false;

    return {
      destination: destination && destination.displayProperties.name,
      place: place && place.displayProperties.name,
      bubble: bubbleName,
      activity: activity && activity.displayProperties.name,
      itemNumber: itemNumber && parseInt(itemNumber, 10),
      inventoryItem: inventoryItem && inventoryItem.displayProperties.description,
      lore: lore && lore.displayProperties.name,
      hash: item.hash,
      destinationHash,
      item,
      completed,
      ...itemOverrides[item.hash]
    };
  }

  presentationItems(presentationHash, dropFirst = true) {
    const root = manifest.DestinyPresentationNodeDefinition[presentationHash];
    let recordHashes = root.children.records.map(r => r.recordHash);
    if (dropFirst) recordHashes = recordHashes.slice(1);

    return recordHashes
      .map(hash => {
        const item = manifest.DestinyRecordDefinition[hash];
        const profileRecord = this.profile.profileRecords.data.records[hash];
        if (!profileRecord) return false;
        const completed = profileRecord.objectives[0].complete;

        const mapping = mappings.records[hash];
        const destinationHash = mapping && mapping.destinationHash;
        const destination = destinationHash && manifest.DestinyDestinationDefinition[destinationHash];
        const place = destination && manifest.DestinyPlaceDefinition[destination.placeHash];
        const bubble = destination && find(destination.bubbles, { hash: mapping.bubbleHash });

        // If we don't have a bubble, see if we can infer one from the bubble ID
        let bubbleName = (bubble && bubble.displayProperties.name) || (mapping && mapping.bubbleId && manualBubbleNames[mapping.bubbleId]) || '';

        return {
          place: place && place.displayProperties.name,
          bubble: bubbleName,
          record: item.displayProperties.name,
          hash,
          destinationHash,
          item,
          completed,
          ...itemOverrides[item.hash]
        };
      })
      .filter(i => i);
  }

  numberedChecklist(name, options = {}) {
    return this.checklist({
      sortBy: ['itemNumber'],
      itemTitle: i => `${this.t(name)} ${i.itemNumber}`,
      ...options
    });
  }

  recordChecklist(options = {}) {
    return this.checklist({
      itemTitle: i => i.record,
      itemSubtitle: i => (i.bubble && i.place ? `${i.bubble}, ${i.place}` : <em>Forsaken Campaign</em>),
      mapPath: i => i.destinationHash && `destiny/maps/${i.destinationHash}/record/${i.hash}`,
      ...options
    });
  }

  checklist(options = {}) {
    const defaultOptions = {
      binding: this.t('Profile bound'),
      itemTitle: i => i.bubble || '???',
      itemSubtitle: i => i.place,
      mapPath: i => i.destinationHash && `destiny/maps/${i.destinationHash}/${i.hash}`
    };

    options = { ...defaultOptions, ...options };

    const items = options.sortBy ? sortBy(options.items, options.sortBy) : options.items;
    const visible = this.hideCompletedItems ? items.filter(i => !i.completed) : items;

    const checklist = (
      <Checklist name={options.name} binding={options.binding} progressDescription={options.progressDescription} totalItems={items.length} completedItems={items.filter(i => i.completed).length}>
        {visible.map(i => (
          <ChecklistItem key={i.hash} completed={i.completed} mapPath={options.mapPath(i)}>
            <div className='text'>
              <p>{options.itemTitle(i)}</p>
              {options.itemSubtitle(i) && <p>{options.itemSubtitle(i)}</p>}
            </div>
          </ChecklistItem>
        ))}
      </Checklist>
    );

    return {
      name: options.name,
      icon: options.icon,
      checklist: checklist
    };
  }
}

export default ChecklistFactoryHelpers;
