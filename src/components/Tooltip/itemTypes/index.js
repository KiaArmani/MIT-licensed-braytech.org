import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import ObservedImage from '../../ObservedImage';
import { enumerateItemState } from '../../../utils/destinyEnums';
import fallback from './fallback';
import weapon from './weapon';
import armour from './armour';
import emblem from './emblem';
import bounty from './bounty';
import mod from './mod';
import ghost from './ghost';
import sparrow from './sparrow';
import subclass from './subclass';
import ui from './ui';
import sandboxPerk from './sandboxPerk';

class ItemTypes extends React.Component {

  render() {
    const { member, hash, itemInstanceId, tooltipType, rollNote = false, tooltips } = this.props;

    let itemComponents;
    if (member.data && member.data.profile.itemComponents.instances.data[itemInstanceId]) {
      itemComponents = member.data.profile.itemComponents;
    } else {
      itemComponents = false;
    }

    let itemState = this.props.itemState;
    let table = this.props.table;

    if (!table) {
      table = 'DestinyInventoryItemDefinition';
    }
  
    let item;
    if (hash === '343') {
      item = {
        redacted: true
      };
    } else {
      item = manifest[table][hash];
    }
  
    if (itemComponents && itemInstanceId) {
      item.itemComponents = {
        state: itemState ? parseInt(itemState, 10) : false,
        instance: itemComponents.instances.data[itemInstanceId] ? itemComponents.instances.data[itemInstanceId] : false,
        sockets: itemComponents.sockets.data[itemInstanceId] ? itemComponents.sockets.data[itemInstanceId].sockets : false,
        perks: itemComponents.perks.data[itemInstanceId] ? itemComponents.perks.data[itemInstanceId].perks : false,
        stats: itemComponents.stats.data[itemInstanceId] ? itemComponents.stats.data[itemInstanceId].stats : false
      };
    }
  
    let kind = 'ui';
    let tier = 'basic';
    let black;
  
    if (item.itemType) {
      switch (item.itemType) {
        case 1:
          kind = 'ui';
          black = ui(item);
          break;
        case 3:
          kind = 'weapon';
          black = weapon(item, member, tooltips.detailedMode);
          break;
        case 2:
          kind = 'armour';
          black = armour(item, member, tooltips.detailedMode);
          break;
        case 14:
          kind = 'emblem';
          black = emblem(item);
          break;
        case 16:
          kind = 'ui sandbox-perk';
          black = subclass(item);
          break;
        case 19:
          kind = 'mod';
          black = mod(item);
          break;
        case 20:
          kind = 'bounty';
          black = ui(item);
          break;
        case 22:
          kind = 'sparrow';
          black = sparrow(item, tooltips.detailedMode);
          break;
        case 24:
          kind = 'ghost';
          black = ghost(item, tooltips.detailedMode);
          break;
        case 26:
          kind = 'bounty';
          black = bounty(item);
          break;
        default:
          kind = '';
          black = fallback(item);
      }
    }
  
    if (table === 'DestinySandboxPerkDefinition') {
      kind = 'ui name-only sandbox-perk';
      black = sandboxPerk(item);
    }

    if (tooltipType) {
      kind = tooltipType;
    }
  
    if (item.inventory) {
      switch (item.inventory.tierType) {
        case 6:
          tier = 'exotic';
          break;
        case 5:
          tier = 'legendary';
          break;
        case 4:
          tier = 'rare';
          break;
        case 3:
          tier = 'uncommon';
          break;
        case 2:
          tier = 'common';
          break;
        default:
          tier = 'common';
      }
    }
  
    if (item.redacted) {
      return (
        <>
          <div className='acrylic' />
          <div className={cx('frame', 'common')}>
            <div className='header'>
              <div className='name'>Classified</div>
              <div>
                <div className='kind'>Insufficient clearance</div>
              </div>
            </div>
            <div className='black'>
              <div className='description'>
                <pre>Keep it clean.</pre>
              </div>
            </div>
          </div>
        </>
      );
    } else {
      itemState = enumerateItemState(parseInt(itemState, 10));
      return (
        <>
          <div className='acrylic' />
          <div className={cx('frame', kind, tier, { 'is-masterworked': itemState.masterworked })}>
            <div className='header'>
              {itemState.masterworked ? <ObservedImage className={cx('image', 'bg')} src={tier === 'exotic' ? `/static/images/extracts/flair/01A3-00001DDC.PNG` : `/static/images/extracts/flair/01A3-00001DDE.PNG`} /> : null}
              <div className='name'>{item.displayProperties.name}</div>
              <div>
                <div className='kind'>{item.itemTypeDisplayName}</div>
                {kind !== 'ui' && item.inventory ? <div className='rarity'>{item.inventory.tierTypeName}</div> : null}
              </div>
            </div>
            {!item.itemComponents && rollNote ? <div className='note'>Non-instanced item (displaying collections roll)</div> : null}
            <div className='black'>
              {this.props.viewport.width <= 600 && item.screenshot ? <ObservedImage className='image screenshot' src={`https://www.bungie.net${item.screenshot}`} /> : null}
              {black}
            </div>
          </div>
        </>
      );
    }
  }
}



function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    viewport: state.viewport,
    tooltips: state.tooltips
  };
}

export default connect(mapStateToProps)(ItemTypes);