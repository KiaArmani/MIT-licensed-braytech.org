import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import Moment from 'react-moment';
import orderBy from 'lodash/orderBy';

import manifest from '../../utils/manifest';
import * as utils from '../../utils/destinyUtils';
import ProgressBar from '../../components/UI/ProgressBar';

class TimePlayed extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, member } = this.props;
    const characters = member.data.profile.characters.data;

    const characterStamps = character => (
      <>
        <span className={cx('stamp', 'light', { max: character.light === 650 })}>{character.light}</span>
        <span className={cx('stamp', 'level')}>{character.baseCharacterLevel}</span>
        <span className={cx('stamp', 'class', utils.classTypeToString(character.classType).toLowerCase())}>{utils.classTypeToString(character.classType)}</span>
      </>
    );

    let chars = [];

    characters.forEach(character => {
      chars.push({
        element: (
          <li key={character.characterId}>
            <div className='c'>
              {characterStamps(character)}
            </div>
            <div className='s t'>
              <div className='n'>Time played</div>
              <div className='v'>
                {Math.floor(parseInt(character.minutesPlayedTotal) / 1440) < 2 ? (
                  <>
                    {Math.floor(parseInt(character.minutesPlayedTotal) / 1440)} {t('day')}
                  </>
                ) : (
                  <>
                    {Math.floor(parseInt(character.minutesPlayedTotal) / 1440)} {t('days')}
                  </>
                )}
              </div>
            </div>
            <div className='s l'>
              <div className='n'>Last played</div>
              <div className='v'>
                <Moment fromNow>{character.dateLastPlayed}</Moment>
              </div>
            </div>
          </li>
        )
      });
    });

    return (
      <ul>
        {chars.map(c => c.element)}
      </ul>
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
)(TimePlayed);
