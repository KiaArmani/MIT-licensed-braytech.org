import React from 'react';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';

import ObservedImage from '../../../components/ObservedImage';
import { ProfileNavLink } from '../../../components/ProfileLink';
import * as ls from '../../../utils/localStorage';
import * as paths from '../../../utils/paths';
import manifest from '../../../utils/manifest';

import Collectibles from '../../../components/Collectibles';

class PresentationNode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: ls.get('setting.hideCompletedRecords') ? ls.get('setting.hideCompletedRecords') : false
    };

    this.toggleCompleted = this.toggleCompleted.bind(this);
  }

  toggleCompleted = () => {
    let currentSetting = ls.get('setting.hideCompletedRecords') ? ls.get('setting.hideCompletedRecords') : false;

    ls.set('setting.hideCompletedRecords', currentSetting ? false : true);

    this.setState({
      hideCompleted: ls.get('setting.hideCompletedRecords')
    });
  };

  render() {
    const { member } = this.props;
    const characterId = member.characterId;
    const characters = member.data.profile.characters.data;
    const character = characters.find(c => c.characterId === characterId);

    let classNodes = {
      0: [811225638, 2598675734],
      1: [3745240322, 2765771634],
      2: [1269917845, 1573256543]
    }

    let primaryHash = this.props.primaryHash;
    let primaryDefinition = manifest.DestinyPresentationNodeDefinition[primaryHash];

    let secondaryHash = this.props.match.params.secondary || false;
    let secondaryChildNodeFind = primaryDefinition.children.presentationNodes.find(child => classNodes[character.classType].includes(child.presentationNodeHash));
    if (!secondaryHash && secondaryChildNodeFind) {
      secondaryHash = secondaryChildNodeFind.presentationNodeHash;
    } else if (!secondaryHash) {
      secondaryHash = primaryDefinition.children.presentationNodes[0].presentationNodeHash;
    } else {
      secondaryHash = parseInt(secondaryHash, 10);
    }
    let secondaryDefinition = manifest.DestinyPresentationNodeDefinition[secondaryHash];

    let tertiaryHash = this.props.match.params.tertiary || false;
    let tertiaryChildNodeFind = secondaryDefinition.children.presentationNodes.find(child => classNodes[character.classType].includes(child.presentationNodeHash));
    if (!tertiaryHash && tertiaryChildNodeFind) {
      tertiaryHash = tertiaryChildNodeFind.presentationNodeHash;
    } else if (!tertiaryHash) {
      tertiaryHash = secondaryDefinition.children.presentationNodes[0].presentationNodeHash;
    } else {
      tertiaryHash = parseInt(tertiaryHash, 10);
    }

    let quaternaryHash = this.props.match.params.quaternary ? this.props.match.params.quaternary : false;

    let primaryChildren = [];
    primaryDefinition.children.presentationNodes.forEach(child => {
      let node = manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash];

      let isActive = (match, location) => {
        if (secondaryHash === child.presentationNodeHash) {
          return true;
        } else {
          return false;
        }
      };

      primaryChildren.push(
        <li key={node.hash} className='linked'>
          <ProfileNavLink isActive={isActive} to={`/collections/${primaryHash}/${node.hash}`}>
            <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${node.displayProperties.icon}`} />
          </ProfileNavLink>
        </li>
      );
    });

    let secondaryChildren = [];
    secondaryDefinition.children.presentationNodes.forEach(child => {
      let node = manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash];

      let isActive = (match, location) => {
        if (tertiaryHash === child.presentationNodeHash) {
          return true;
        } else {
          return false;
        }
      };

      secondaryChildren.push(
        <li key={node.hash} className='linked'>
          <ProfileNavLink isActive={isActive} to={`/collections/${primaryHash}/${secondaryHash}/${node.hash}`}>
            {node.displayProperties.name}
          </ProfileNavLink>
        </li>
      );
    });

    return (
      <div className='node'>
        <div className='header'>
          <div className='name'>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            {primaryDefinition.displayProperties.name} <span>{primaryDefinition.children.presentationNodes.length !== 1 ? <>// {secondaryDefinition.displayProperties.name}</> : null}</span>
          </div>
        </div>
        <div className='children'>
          <ul
            className={cx('list', 'primary', {
              'single-primary': primaryDefinition.children.presentationNodes.length === 1
            })}
          >
            {primaryChildren}
          </ul>
          <ul className='list secondary'>{secondaryChildren}</ul>
        </div>
        <div className='collectibles'>
          <ul className='list tertiary collection-items'>
            <Collectibles {...this.props} {...this.state} node={tertiaryHash} highlight={quaternaryHash} inspect selfLinkFrom={paths.removeMemberIds(this.props.location.pathname)} />
          </ul>
        </div>
      </div>
    );
  }
}

export default PresentationNode;
