import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import { ProfileLink } from '../../components/ProfileLink';
import ObservedImage from '../../components/ObservedImage';
import { enumerateItemState } from '../../utils/destinyEnums';

import './styles.css';

class Items extends React.Component {
  constructor(props) {
    super(props);

    this.scrollToRecordRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.highlight && this.scrollToRecordRef.current !== null) {
      window.scrollTo({
        top: this.scrollToRecordRef.current.offsetTop + this.scrollToRecordRef.current.offsetHeight / 2 - window.innerHeight / 2
      });
    }
  }

  render() {
    const inspect = this.props.inspect ? true : false;

    let items = [];

    let itemsRequested = this.props.hashes;

    itemsRequested.forEach(hash => {
      let itemDefinition = manifest.DestinyInventoryItemDefinition[hash];

      let state = 0;
      // if (this.props.member.data) {
        
      //   const characterId = this.props.member.characterId;

      //   const characterCollectibles = this.props.member.data.profile.characterCollectibles.data;
      //   const profileCollectibles = this.props.member.data.profile.profileCollectibles.data;
      
      //   let scope = profileCollectibles.collectibles[hash] ? profileCollectibles.collectibles[hash] : characterCollectibles[characterId].collectibles[hash];
      //   if (scope) {
      //     state = scope.state;
      //   }

      //   if (this.props.collectibles.hideInvisibleCollectibles && enumerateCollectibleState(state).invisible) {
      //     return;
      //   }

      // }

      items.push(
        <li
          key={itemDefinition.hash}
          className={cx({
            tooltip: !this.props.disableTooltip,
            linked: true
            // completed: !enumerateItemState(state).
          })}
          data-itemhash={itemDefinition.hash}
        >
          <div className='icon'>
            <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${itemDefinition.displayProperties.icon}`} />
          </div>
          <div className='text'>
            <div className='name'>{itemDefinition.displayProperties.name}</div>
          </div>
          {inspect && itemDefinition.itemHash ? <Link to={{ pathname: `/inspect/${itemDefinition.itemHash}`, state: { from: this.props.selfLinkFrom } }} /> : null}
        </li>
      );
    });
    

    return items;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default connect(mapStateToProps)(Items);
