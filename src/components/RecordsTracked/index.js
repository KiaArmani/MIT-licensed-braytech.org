import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import Records from '../Records';
import { ProfileLink } from '../../components/ProfileLink';
import { enumerateRecordState } from '../../utils/destinyEnums';

class RecordsTracked extends React.Component {
  render() {
    const { member, triumphs, limit, pageLink } = this.props;
    const characterRecords = member.data.profile.characterRecords.data;
    const profileRecords = member.data.profile.profileRecords.data.records;
    const characterId = member.characterId;
    let hashes = triumphs.tracked;

    

    hashes = hashes.filter(hash => {

      let state;
      if (profileRecords[hash]) {
        state = profileRecords[hash] ? profileRecords[hash].state : 0;
      } else if (characterRecords[characterId].records[hash]) {
        state = characterRecords[characterId].records[hash] ? characterRecords[characterId].records[hash].state : 0;
      } else {
        state = 0;
      }

      return !enumerateRecordState(state).recordRedeemed && enumerateRecordState(state).objectiveNotCompleted

    });

    return (
      <ul className={cx('list record-items tracked')}>
        <Records selfLink {...this.props} hashes={hashes} ordered='progress' limit={limit} />
        {pageLink && hashes.length > 0 ? (
          <li key='pageLink' className='linked'>
            <ProfileLink to={{ pathname: '/triumphs/tracked', state: { from: '/triumphs' } }}>See all tracked</ProfileLink>
          </li>
        ) : null}
        {hashes.length < 1 ? (
          <li key='none-tracked' className='none-tracked'>
            <div className='properties'>
              <div className='text'>
                <div className='name'>Nothing tracked</div>
                <div className='description'>You aren't tracking any records yet!</div>
              </div>
            </div>
          </li>
        ) : null}
        {/* {pageLink && (this.props.location && this.props.location.pathname !== '/triumphs') && hashes.length < 1 ? (
          <li key='pageLink' className='linked'>
            <ProfileLink to={{ pathname: '/triumphs', state: { from: '/triumphs' } }}>See all triumphs</ProfileLink>
          </li>
        ) : null} */}
      </ul>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    triumphs: state.triumphs
  };
}

export default compose(connect(mapStateToProps))(RecordsTracked);
