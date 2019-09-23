import React from 'react';
import cx from 'classnames';
import { withNamespaces } from 'react-i18next';
import manifest from '../../../utils/manifest';

import ObservedImage from '../../../components/ObservedImage';
import Collectibles from '../../../components/Collectibles';
import * as paths from '../../../utils/paths';
import { enumerateCollectibleState } from '../../../utils/destinyEnums';

class BadgeNode extends React.Component {
  render() {
    const { t } = this.props;
    const characterId = this.props.member.characterId;

    const characterCollectibles = this.props.member.data.profile.characterCollectibles.data;
    const profileCollectibles = this.props.member.data.profile.profileCollectibles.data;

    let badgeDefinition = manifest.DestinyPresentationNodeDefinition[this.props.match.params.secondary];

    let badgeChildren = [];
    let classStates = [];

    badgeDefinition.children.presentationNodes.forEach(node => {
      let nodeDefinition = manifest.DestinyPresentationNodeDefinition[node.presentationNodeHash];

      let classState = [];

      nodeDefinition.children.collectibles.forEach(child => {
        let scope = profileCollectibles.collectibles[child.collectibleHash] ? profileCollectibles.collectibles[child.collectibleHash] : characterCollectibles[characterId].collectibles[child.collectibleHash];
        if (scope) {
          classState.push(scope.state);
        } else {
          console.log(`34 Undefined state for ${child.collectibleHash}`);
        }
      });

      badgeChildren.push(
        <div key={nodeDefinition.hash} className='class'>
          <div className='sub-header sub'>
            <div>{nodeDefinition.displayProperties.name}</div>
          </div>
          <ul className='list tertiary collection-items'>
            <Collectibles {...this.props} {...this.state} node={node.presentationNodeHash} inspect selfLinkFrom={paths.removeMemberIds(this.props.location.pathname)} />
          </ul>
        </div>
      );

      classStates.push({
        class: nodeDefinition.displayProperties.name,
        states: classState
      });
    });

    let completed = false;
    let progress = [];

    classStates.forEach(obj => {
      if (obj.states.filter(collectible => !enumerateCollectibleState(collectible).notAcquired).length === obj.states.filter(collectible => !enumerateCollectibleState(collectible).invisible).length) {
        completed = true;
      }
      progress.push(
        <div key={obj.class} className='progress'>
          <div className='class-icon'>
            <span className={`destiny-class_${obj.class.toLowerCase()}`} />
          </div>
          <div className='text'>
            <div className='title'>{obj.class}</div>
            <div className='fraction'>
              {obj.states.filter(collectible => !enumerateCollectibleState(collectible).notAcquired).length}/{obj.states.filter(collectible => !enumerateCollectibleState(collectible).invisible).length}
            </div>
          </div>
          <div
            className={cx('bar', {
              completed: obj.states.filter(collectible => !enumerateCollectibleState(collectible).notAcquired).length === obj.states.filter(collectible => !enumerateCollectibleState(collectible).invisible).length
            })}
          >
            <div
              className='fill'
              style={{
                width: `${(obj.states.filter(collectible => !enumerateCollectibleState(collectible).notAcquired).length / obj.states.filter(collectible => !enumerateCollectibleState(collectible).invisible).length) * 100}%`
              }}
            />
          </div>
        </div>
      );
    });

    let hires = {
      3241617029: '01E3-00000278.png',
      1419883649: '01E3-00000280.png',
      3333531796: '01E3-0000027C.png',
      2904806741: '01E3-00000244.png',
      1331476689: '01E3-0000024C.png',
      2881240068: '01E3-00000248.png',
      3642989833: '01E3-00000266.png',
      2399267278: '037E-00001D4C.png',
      701100740: '01A3-0000189C.png',
      1420354007: '01E3-0000032C.png',
      1086048586: '01E3-00000377.png',
      2503214417: '0560-00000D7D.png'
    };

    //`https://www.bungie.net${badgeDefinition.displayProperties.icon}`

    return (
      <div className='node badge'>
        <div className='children'>
          <div className='icon'>
            <ObservedImage className={cx('image')} src={`/static/images/extracts/badges/${hires[badgeDefinition.hash]}`} />
          </div>
          <div className='text'>
            <div className='name'>{badgeDefinition.displayProperties.name}</div>
            <div className='description'>{badgeDefinition.displayProperties.description}</div>
          </div>
          <div className='until'>
            {completed ? <h4 className='completed'>{t('Badge completed')}</h4> : <h4>{t('Badge progress')}</h4>}
            {progress}
          </div>
        </div>
        <div className='records'>{badgeChildren}</div>
      </div>
    );
  }
}

export default withNamespaces()(BadgeNode);
