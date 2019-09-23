import React from 'react';
import cx from 'classnames';

import Globals from '../../../utils/globals';
import ObservedImage from '../../ObservedImage';
import { getSockets } from '../../../utils/destinyItems';
import manifest from '../../../utils/manifest';

const emblem = item => {
  let sockets = [];

  let sourceString = item.collectibleHash ? (manifest.DestinyCollectibleDefinition[item.collectibleHash] ? manifest.DestinyCollectibleDefinition[item.collectibleHash].sourceString : false) : false;

  let description = item.displayProperties.description !== '' ? item.displayProperties.description : false;

  if (item.sockets) {
    sockets = getSockets(manifest, item, false, true, [1608119540]).sockets;

    let variants = item.sockets.socketEntries.find(socket => socket.singleInitialItemHash === 1608119540);
    if (variants) {
      let plugs = [];
      variants.reusablePlugItems
        .filter(plug => plug.plugItemHash !== 1608119540)
        .forEach(plug => {
          let def = manifest.DestinyInventoryItemDefinition[plug.plugItemHash];
          plugs.push({
            element: (
              <div key={def.hash} className={cx('plug', 'tooltip')} data-itemhash={def.hash}>
                <ObservedImage className={cx('image', 'icon')} src={`${Globals.url.bungie}${def.displayProperties.icon}`} />
                <div className='text'>
                  <div className='name'>{def.displayProperties.name}</div>
                  <div className='description'>Emblem variant</div>
                </div>
              </div>
            )
          });
        });
      if (plugs.length > 0) {
        sockets.push({
          plugs
        });
      }
    }
  }

  return (
    <>
      <ObservedImage className={cx('image', 'emblem')} src={`https://www.bungie.net${item.secondaryIcon}`} />
      {description ? (
        <div className='description'>
          <pre>{description}</pre>
        </div>
      ) : null}
      <div className={cx('sockets', { 'has-sockets': sockets.length > 0 })}>{sockets.length > 0 ? sockets.map(socket => socket.plugs.map(plug => plug.element)) : null}</div>
      {sourceString ? (
        <div className={cx('source', { 'no-border': !description })}>
          <p>{sourceString}</p>
        </div>
      ) : null}
    </>
  );
};

export default emblem;
