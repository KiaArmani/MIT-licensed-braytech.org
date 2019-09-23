import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { flattenDepth } from 'lodash';
import cx from 'classnames';

import * as bungie from '../../utils/bungie';
import getPGCR from '../../utils/getPGCR';

import Characters from './Characters';
import NightfallHighScores from './NightfallHighScores';
import RaidReport from './RaidReport';

import './styles.css';

class Legend extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      cacheState: {}
    };
  }

  cacheMachine = async (mode) => {
    const { member, PGCRcache } = this.props;

    let charactersIds = member.data.profile.characters.data.map(c => c.characterId);

    // console.log(charactersIds)

    let requests = charactersIds.map(async c => {
      let response = await bungie.activityHistory(member.membershipType, member.membershipId, c, 250, mode, 0);
      return response.activities || [];
    });

    let activities = await Promise.all(requests);
    activities = flattenDepth(activities, 1);

    this.setState(p => {
      p.cacheState[mode] = activities.length;
      return p;
    });
    
    let PGCRs = activities.map(async activity => {
      if (PGCRcache[member.membershipId] && activity && !PGCRcache[member.membershipId].find(pgcr => pgcr.activityDetails.instanceId === activity.activityDetails.instanceId)) {
        return getPGCR(member.membershipId, activity.activityDetails.instanceId);
      } else if (!PGCRcache[member.membershipId] && activity) {
        return getPGCR(member.membershipId, activity.activityDetails.instanceId);
      } else {
        return true;
      }
    });

    return await Promise.all(PGCRs);
  }

  async componentDidMount() {
    let modes = ['46', '4'];
    let ignition = await modes.map(m => { return this.cacheMachine(m); });

    try {
      await Promise.all(ignition);
    } catch (e) {
      console.log(e);
    }

    this.setState(p => {
      p.loading = false;
      return p;
    });
  }

  render() {
    return (
      <div className={cx('view')} id='legend'>
        <div className='section characters'>
          <Characters />
        </div>
        <div className='section strikes'>
          <NightfallHighScores cacheLoading={this.state.loading} cacheState={this.state.cacheState} />
        </div>
        <div className='section raids'>
          <RaidReport cacheLoading={this.state.loading} cacheState={this.state.cacheState} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    PGCRcache: state.PGCRcache
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Legend);
