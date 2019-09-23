import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { orderBy, isEqual, flattenDepth } from 'lodash';

import * as bungie from '../../../utils/bungie';
import getPGCR from '../../../utils/getPGCR';
import Spinner from '../../UI/Spinner';

import PGCR from '../PGCR';

import './styles.css';

class Matches extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      cacheState: {}
    };

    this.running = false;
  }

  cacheMachine = async (mode, characterId) => {
    const { member, PGCRcache } = this.props;

    let charactersIds = characterId ? [characterId] : member.data.profile.characters.data.map(c => c.characterId);

    // console.log(charactersIds)

    let requests = charactersIds.map(async c => {
      let response = await bungie.activityHistory(member.membershipType, member.membershipId, c, 30, mode, 0);
      return response.activities || [];
    });

    let activities = await Promise.all(requests);
    activities = flattenDepth(activities, 1);
    activities = orderBy(activities, [pgcr => pgcr.period], ['desc']);
    activities = activities.slice(0, 30);

    this.setState(p => {
      let identifier = mode ? mode : 'all';
      p.cacheState[identifier] = activities.length;
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
  };

  run = async () => {
    const { modes, characterId = false } = this.props;

    if (!this.state.loading) {
      //console.log('matches refresh start');

      this.running = true;

      let ignition = modes ? await modes.map(m => {
        return this.cacheMachine(m, characterId);
      }) : [await this.cacheMachine(false, characterId)];
  
      try {
        await Promise.all(ignition);
      } catch (e) {}
  
      this.setState(p => {
        p.loading = false;
        return p;
      });
      this.running = false;

      //console.log('matches refresh end');
    } else {
      //console.log('matches refresh skipped');
    }
  }

  componentDidMount() {
    this.run();
    this.startInterval();
  }

  componentDidUpdate(prev) {
    const { modes } = this.props;

    if (!isEqual(prev.modes, modes)) {
      this.run();
    }
  }

  startInterval() {
    this.refreshDataInterval = window.setInterval(this.run, 30000);
  }

  clearInterval() {
    window.clearInterval(this.refreshDataInterval);
  }

  componentWillUnmount() {
    this.clearInterval();
  }

  render() {
    const { t, member, PGCRcache, modes } = this.props;

    let PGCRs = [];
    
    if (modes && PGCRcache[member.membershipId]) {
      PGCRs = orderBy(PGCRcache[member.membershipId].filter(pgcr => modes.some(m => pgcr.activityDetails.modes.includes(m))), [pgcr => pgcr.period], ['desc']);
    } else if (PGCRcache[member.membershipId]) {
      PGCRs = orderBy(PGCRcache[member.membershipId], [pgcr => pgcr.period], ['desc']);
    }

    return PGCRs.length ? <PGCR data={PGCRs} limit='30' RebindTooltips={this.props.RebindTooltips} /> : <Spinner />;
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
)(Matches);
