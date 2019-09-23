import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import Moment from 'react-moment';
import orderBy from 'lodash/orderBy';

import manifest from '../../utils/manifest';
import * as utils from '../../utils/destinyUtils';
import ObservedImage from '../../components/ObservedImage';

class Characters extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, member } = this.props;
    const characters = member.data.profile.characters.data;

    let chars = [];
    characters.forEach(character => {

      const subClassInfo = utils.getSubclassPathInfo(member.data.profile, character.characterId);

      chars.push({
        element: (
          <div key={character.characterId} className='character'>
            <div className={cx('bg', subClassInfo.element)}>
              <div className={cx('insignia', utils.classTypeToString(character.classType).toLowerCase())} />
              <div className='art'>
                <ObservedImage className='image' src={`/static/images/extracts/subclass-art/${subClassInfo.art}.png`} />
                <div className='name'>
                  <div className='top' />
                  <div className='text'>{subClassInfo.name}</div>
                  <div className='bottom' />
                </div>
              </div>
            </div>
            <div className='datum'>
              <div className='d'>
                <div className='v l'>{character.light}</div>
                <div className='n'>{t('power')}</div>
              </div>
              <div className='d'>
                <div className='v'>{manifest.DestinyClassDefinition[character.classHash].genderedClassNamesByGenderHash[character.genderHash]}</div>
                <div className='n'>{t('class')}</div>
              </div>
              <div className='d'>
                <div className='v'>{manifest.DestinyRaceDefinition[character.raceHash].genderedRaceNamesByGenderHash[character.genderHash]}</div>
                <div className='n'>{t('born')}</div>
              </div>
              <div className='d'>
                <div className='v'>{Math.floor(parseInt(character.minutesPlayedTotal) / 1440)}</div>
                <div className='n'>{Math.floor(parseInt(character.minutesPlayedTotal) / 1440) === 1 ? t('day played') : t('days played')}</div>
              </div>
            </div>
          </div>
        )
      });
    });

    return chars.map(c => c.element);
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
)(Characters);
