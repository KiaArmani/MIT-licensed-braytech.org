import React from 'react';
import cx from 'classnames';

import ObservedImage from '../../ObservedImage';
import { getSockets } from '../../../utils/destinyItems';
import manifest from '../../../utils/manifest';

const armour = (item, member, detailedMode) => {
  let { stats, sockets } = getSockets(item, false, detailedMode ? true : false, detailedMode ? false : true);

  let sourceString = item.collectibleHash ? (manifest.DestinyCollectibleDefinition[item.collectibleHash] ? manifest.DestinyCollectibleDefinition[item.collectibleHash].sourceString : false) : false;

  let intrinsic = sockets.find(socket => (socket.singleInitialItem ? socket.singleInitialItem.definition.itemCategoryHashes.includes(2237038328) : false));
  intrinsic = intrinsic ? manifest.DestinySandboxPerkDefinition[intrinsic.singleInitialItem.definition.perks[0].perkHash] : false;

  let powerLevel;
  if (member && member.data) {
    let character = member.data.profile.characters.data.find(c => c.characterId === member.characterId);
    powerLevel = Math.floor(680 / 700 * character.light);
  } else if (item.itemComponents && item.itemComponents.instance) {
    powerLevel = item.itemComponents.instance.primaryStat.value;    
  } else {
    powerLevel = '680';
  }  

  return (
    <>
      <div className='damage armour'>
        <div className={cx('power')}>
          <div className='text'>{powerLevel}</div>
          <div className='text'>{manifest.DestinyStatDefinition[3897883278].displayProperties.name}</div>
        </div>
      </div>
      {sourceString ? (
        <div className='source'>
          <p>{sourceString}</p>
        </div>
      ) : null}
      {stats.length > 0 ? <div className='stats'>{stats.map(stat => stat.element)}</div> : null}
      <div className={cx('sockets', { 'has-sockets': sockets.length > 0, 'detailed-mode': detailedMode })}>
        {intrinsic ? (
          <div className='plug is-active intrinsic'>
            <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${intrinsic.displayProperties.icon}`} />
            <div className='text'>
              <div className='name'>{intrinsic.displayProperties.name}</div>
              <div className='description'>{intrinsic.displayProperties.description}</div>
            </div>
          </div>
        ) : null}
        {sockets.length > 0
          ? sockets.map((socket, i) => {
            let group = socket.plugs
              .filter(plug => !plug.definition.itemCategoryHashes.includes(2237038328))

            if (group.length > 0) {
              return (
                <div key={i} className='group'>
                  {group.length > 4 ? (
                      <>
                        {group.slice(0,3).map(plug => plug.element)}
                        <div className='plug ellipsis'>+ {group.length - 3} more</div>
                      </>
                    ) : group.map(plug => plug.element)}
                </div>
              )
            } else {
              return null;
            }
          })
          : null}
      </div>
    </>
  );
};

export default armour;
