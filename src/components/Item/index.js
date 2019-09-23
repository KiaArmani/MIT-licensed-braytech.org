import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';

import manifest from '../../utils/manifest';

import ObservedImage from '../../components/ObservedImage';
import { enumerateCollectibleState, enumerateItemState } from '../../utils/destinyEnums';

import './styles.css';

class Item extends React.Component {
  render() {
    const { data, member, showMemberState } = this.props;

    let hash = data.itemHash;
    let itemDefinition = manifest.DestinyInventoryItemDefinition[hash];

    let state = 0;
    if (member.data && showMemberState) {
      let hash = itemDefinition.collectibleHash ? itemDefinition.collectibleHash : false;
      if (hash) {
        let characterId = member.characterId;
        let characterCollectibles = member.data.profile.characterCollectibles.data;
        let profileCollectibles = member.data.profile.profileCollectibles.data;

        let scope = profileCollectibles.collectibles[hash] ? profileCollectibles.collectibles[hash] : characterCollectibles[characterId].collectibles[hash];
        if (scope) {
          state = scope.state;
        }
      }
    }

    if (itemDefinition.redacted) {
      return (
        <>
          <ul className='list'>
            <li
              className={cx('item', 'tooltip', {
                'not-acquired': member.data && enumerateCollectibleState(state).notAcquired,
                'is-masterworked': enumerateItemState(data.itemState).masterworked
              })}
              data-itemhash={itemDefinition.hash}
              data-iteminstanceid={data.itemInstanceId}
              data-itemstate={data.itemState}
            >
              <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${manifest.settings.destiny2CoreSettings.undiscoveredCollectibleImage}`} />
              {data.quantity > 1 ? <div className='quantity'>{data.quantity}</div> : null}
            </li>
          </ul>
        </>
      );
    } else {
      return (
        <>
          <ul className='list'>
            <li
              className={cx('item', 'tooltip', {
                'not-acquired': member.data && enumerateCollectibleState(state).notAcquired,
                'is-masterworked': enumerateItemState(data.itemState).masterworked
              })}
              data-itemhash={itemDefinition.hash}
              data-iteminstanceid={data.itemInstanceId}
              data-itemstate={data.itemState}
            >
              <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${itemDefinition.displayProperties.icon}`} />
              {data.quantity > 1 ? <div className='quantity'>{data.quantity}</div> : null}
            </li>
          </ul>
        </>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default connect(mapStateToProps)(Item);
