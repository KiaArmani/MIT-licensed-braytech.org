import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import { withNamespaces } from 'react-i18next';

import store from '../../utils/reduxStore';
import * as ls from '../../utils/localStorage';
import Spinner from '../../components/UI/Spinner';
import ProfileError from './ProfileError';

import ProfileSearch from './ProfileSearch';
import Profile from './Profile';

import './styles.css';

class CharacterSelect extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  characterClick = characterId => {
    const { membershipType, membershipId } = this.props.member;

    ls.set('setting.profile', { membershipType, membershipId, characterId });
  };

  profileClick = async (membershipType, membershipId, displayName) => {
    window.scrollTo(0, 0);

    store.dispatch({ type: 'MEMBER_LOAD_MEMBERSHIP', payload: { membershipType, membershipId } });

    if (displayName) {
      ls.update('history.profiles', { membershipType, membershipId, displayName }, true, 9);
    }
  };

  render() {
    const { member, theme, viewport } = this.props;
    const { error, loading } = member;

    const { from } = this.props.location.state || { from: { pathname: '/' } };
    const reverse = viewport.width <= 500;

    const profileCharacterSelect = (
      <div className='profile'>
        {loading && <Spinner />}
        {member.data && <Profile member={member} onCharacterClick={this.characterClick} from={from} />}
      </div>
    );

    return (
      <div className={cx('view', theme.selected, { loading })} id='get-profile'>
        {reverse && profileCharacterSelect}

        <div className='search'>
          {error && <ProfileError error={error} />}
          <ProfileSearch onProfileClick={this.profileClick} />
        </div>

        {!reverse && profileCharacterSelect}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    theme: state.theme,
    viewport: state.viewport
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(CharacterSelect);
