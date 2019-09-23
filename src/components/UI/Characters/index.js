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

class Characters extends React.Component {
  render() {
    const { t, member } = this.props;
    let characters = member.data.profile.characters.data;
    let characterProgressions = member.data.profile.characterProgressions.data;

    // console.log(`Characters component: `, this.props);

    let charactersRender = [];

    characters.forEach(character => {
      let capped = characterProgressions[character.characterId].progressions[1716568313].level === characterProgressions[character.characterId].progressions[1716568313].levelCap ? true : false;

      let progress = capped ? characterProgressions[character.characterId].progressions[2030054750].progressToNextLevel / characterProgressions[character.characterId].progressions[2030054750].nextLevelAt : characterProgressions[character.characterId].progressions[1716568313].progressToNextLevel / characterProgressions[character.characterId].progressions[1716568313].nextLevelAt;

      let profileLink = `/${member.membershipType}/${member.membershipId}/${character.characterId}${removeMemberIds(this.props.location.pathname)}`;

      charactersRender.push(
        <li key={character.characterId} className='linked'>
          <ObservedImage
            className={cx('image', 'emblem', {
              missing: !character.emblemBackgroundPath
            })}
            src={`https://www.bungie.net${character.emblemBackgroundPath ? character.emblemBackgroundPath : `/img/misc/missing_icon_d2.png`}`}
          />
          <div className='class'>{utils.classHashToString(character.classHash, character.genderType)}</div>
          <div className='species'>{utils.raceHashToString(character.raceHash, character.genderType)}</div>
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
          <Link
            to={profileLink}
            onClick={e => {
              this.props.characterClick(character.characterId);
            }}
          />
        </li>
      );
    });

    return (
      <div className={cx('characters-list', this.props.theme.selected)}>
        <ul className='list'>{charactersRender}</ul>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Characters);
