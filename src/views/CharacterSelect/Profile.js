/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';

import Characters from '../../components/UI/Characters';

class Profile extends React.Component {
  render() {
    const { t, member, from } = this.props;

    const groups = member.data.groups.results;

    const timePlayed = Math.floor(
      Object.keys(member.data.profile.characters.data).reduce((sum, key) => {
        return sum + parseInt(member.data.profile.characters.data[key].minutesPlayedTotal);
      }, 0) / 1440
    );

    return (
      <div className='user'>
        <div className='info'>
          <div className='displayName'>{member.data.profile.profile.data.userInfo.displayName}</div>
          {groups.length === 1 && <div className='clan'>{groups[0].group.name}</div>}
          <div className='timePlayed'>
            {timePlayed} {timePlayed === 1 ? t('day played') : t('days played')}
          </div>{' '}
        </div>
        <Characters data={member.data} location={{ ...from }} characterClick={this.props.onCharacterClick} />
      </div>
    );
  }
}

Profile.propTypes = {
  onCharacterClick: PropTypes.func.isRequired,
  from: PropTypes.object.isRequired,
  member: PropTypes.object.isRequired
};

export default withNamespaces()(Profile);
