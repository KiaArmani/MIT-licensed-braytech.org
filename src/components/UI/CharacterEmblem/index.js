import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { withNamespaces } from 'react-i18next';

import ObservedImage from '../../ObservedImage';
import * as utils from '../../../utils/destinyUtils';
import { removeMemberIds } from '../../../utils/paths';

import './styles.css';

class CharacterEmblem extends React.Component {
  render() {
    const { t, data, characterId = data.characters.data[0].characterId, responsive, combat } = this.props;

    let character = data.characters.data.find(c => c.characterId === characterId);
    let characterProgressions = data.characterProgressions.data;

    let capped = characterProgressions[character.characterId].progressions[1716568313].level === characterProgressions[character.characterId].progressions[1716568313].levelCap ? true : false;

    let progress = capped ? characterProgressions[character.characterId].progressions[2030054750].progressToNextLevel / characterProgressions[character.characterId].progressions[2030054750].nextLevelAt : characterProgressions[character.characterId].progressions[1716568313].progressToNextLevel / characterProgressions[character.characterId].progressions[1716568313].nextLevelAt;

    // let profileLink = `/${member.membershipType}/${member.membershipId}/${character.characterId}${removeMemberIds(this.props.location.pathname)}`;

    return (
      <div className={cx('character-emblem', { responsive } )}>
        <ul className='list'>
          <li key={character.characterId}>
            <ObservedImage
              className={cx('image', 'emblem', {
                missing: !character.emblemBackgroundPath
              })}
              src={`https://www.bungie.net${character.emblemBackgroundPath ? character.emblemBackgroundPath : `/img/misc/missing_icon_d2.png`}`}
            />
            <div className='class'>{combat ? utils.classHashToString(character.classHash, character.genderType) : data.profile.data.userInfo.displayName}</div>
            <div className='species'>{combat ? utils.classHashToString(character.classHash, character.genderType) : data.group ? data.group.detail.name : ''}</div>
            <div className='light'>{character.light}</div>
            <div className='level'>
              {t('Level')} {character.baseCharacterLevel}
            </div>
            <div className='progress'>
              <div
                className={cx('bar', {
                  capped: capped
                })}
                style={{
                  width: `${progress * 100}%`
                }}
              />
            </div>
            {/* <Link
            to={profileLink}
            onClick={e => {
              this.props.characterClick(character.characterId);
            }}
          /> */}
          </li>
        </ul>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(CharacterEmblem);
