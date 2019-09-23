import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import manifest from '../../../utils/manifest';

import Globals from '../../../utils/globals';
import ObservedImage from '../../../components/ObservedImage';

import godRolls from '../../../data/godRolls';

import './styles.css';

class GodRolls extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.items = [];
  }

  init = () => {
    if (this.items.length === 0) {
      godRolls.list.forEach(roll => {
        let index = this.items.findIndex(item => item.hash === roll.itemHash);
        if (index > -1) {
          let concatenated = this.items[index].plugs;
          roll.plugs.forEach(plug => {
            if (concatenated.indexOf(plug) < 0) {
              concatenated.push(plug);
            }
          });
          this.items[index].plugs = concatenated;
        } else {
          this.items.push({
            hash: roll.itemHash,
            plugs: roll.plugs
          });
        }
      });
    }
  };

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentWillUnmount() {}

  render() {
    const { t } = this.props;

    this.init();

    let items = [];

    this.items.forEach(item => {
      let definition = manifest.DestinyInventoryItemDefinition[item.hash];

      let sockets = [];
      let output = [];

      item.plugs.forEach(hash => {
        let plug = manifest.DestinyInventoryItemDefinition[hash];

        if (!plug) {
          return;
        }

        let index = sockets.findIndex(socket => socket.plugCategoryHash === plug.plug.plugCategoryHash);
        if (index > -1) {
          let concatenated = sockets[index].plugs;
          concatenated.push(plug.hash);
          sockets[index].plugs = concatenated;
        } else {
          sockets.push({
            plugCategoryHash: plug.plug.plugCategoryHash,
            active: plug.hash,
            plugs: [plug.hash]
          });
        }
      });

      // console.log(sockets);

      sockets.forEach(socket => {
        let elements = [];

        socket.plugs.forEach(hash => {
          let plug = manifest.DestinyInventoryItemDefinition[hash];

          elements.push({
            active: plug.hash === socket.active,
            definition: plug,
            element: (
              <div key={plug.hash} className={cx('plug', 'tooltip', { 'is-intrinsic': plug.itemCategoryHashes.includes(2237038328), 'is-active': plug.hash === socket.active })} data-itemhash={plug.hash}>
                <ObservedImage className={cx('image', 'icon')} src={`${Globals.url.bungie}${plug.displayProperties.icon}`} />
                <div className='text'>
                  <div className='name'>{plug.displayProperties.name}</div>
                  <div className='description'>{plug.itemTypeDisplayName}</div>
                </div>
              </div>
            )
          });
        });

        output.push({
          categoryHash: socket.plugCategoryHash,
          active: socket.active,
          plugs: elements
        });
      });

      items.push({
        itemTypeDisplayName: definition.itemTypeDisplayName,
        element: (
          <div key={item.hash} className='item'>
            <div className='properties'>
              <div className='display'>
                <ObservedImage className='image icon' src={`${Globals.url.bungie}${definition.displayProperties.icon}`} />
                <div className='group'>
                  <div className='name'>{definition.displayProperties.name}</div>
                  <div className='itemTypeDisplayName'>{definition.itemTypeDisplayName}</div>
                </div>
                <div className='description'>{definition.displayProperties.description}</div>
              </div>
              <div className='sockets'>
                <div className={cx('category', 'is-perks')}>
                  <div className='sub-header sub'>
                    <div>Weapon perks</div>
                  </div>
                  <div className='sockets'>
                    {output.map((socket, index) => {
                      if (socket.plugs.length > 0) {
                        return (
                          <div key={index} className='socket'>
                            {socket.plugs.map(plug => plug.element)}
                          </div>
                        );
                      } else if (socket.singleInitialItem) {
                        return (
                          <div key={index} className='socket'>
                            {socket.singleInitialItem.element}
                          </div>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      });
    });

    return (
      <div className={cx('view', this.props.theme.selected)} id='god-rolls'>
        <div className='items'>{items.map(item => item.element)}</div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(GodRolls);
