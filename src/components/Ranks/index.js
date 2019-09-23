import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import Moment from 'react-moment';
import orderBy from 'lodash/orderBy';

import { ProfileLink } from '../../components/ProfileLink';
import manifest from '../../utils/manifest';
import ObservedImage from '../../components/ObservedImage';
import MemberLink from '../../components/MemberLink';
import Spinner from '../../components/UI/Spinner';
import * as utils from '../../utils/destinyUtils';
import * as destinyEnums from '../../utils/destinyEnums';
import * as voluspa from '../../utils/voluspa';

import './styles.css';

class Ranks extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      response: false,
      offset: this.props.offset || 0,
      limit: this.props.includeMember && this.props.member.membershipId ? 9 : this.props.limit || 0,
      sort: this.props.sort || 'triumphScore'
    };
  }
  
  callVoulspa = async () => {
    this.setState((prevState, props) => {
      prevState.loading = true;
      return prevState;
    });

    let [leaderboard, memberRank] = await Promise.all([voluspa.leaderboard(this.state.offset, this.state.limit), voluspa.memberRank(this.props.member.membershipType, this.props.member.membershipId)]);

    let response = {
      leaderboard: leaderboard ? leaderboard : false,
      memberRank: memberRank ? memberRank : false
    };

    this.setState((prevState, props) => {
      prevState.loading = false;
      prevState.response = response;
      return prevState;
    });
  }

  async componentDidMount() {
    window.scrollTo(0, 0);

    this.callVoulspa();
  }

  render() {
    const { t, member } = this.props;

    let ranks = [];

    if (this.state.response) {

      let response = this.state.response;

      console.log(response);

      response.leaderboard.data.forEach((member, index) => {

        let characters = Object.values(member.characters).sort(function(a, b) {
          return parseInt(b.minutesPlayedTotal) - parseInt(a.minutesPlayedTotal);
        });
        let lastCharacter = characters[0];

        ranks.push({
          membershipId: member.destinyUserInfo.membershipId,
          rank: member.rank,
          element: (
            <li key={member.destinyUserInfo.membershipId}>
              <div className='col'>
                <div className='rank'>{member.rank}</div>
              </div>
              <div className='col'>
                <MemberLink {...member.destinyUserInfo} displayClan />
              </div>
              <div className='col'>
                <div className='triumphScore'>{member.triumphScore.toLocaleString()}</div>
              </div>
            </li>
          )
        });
      });

      let memberRank = response.memberRank;
      if (memberRank.destinyUserInfo) {
        ranks.push({
          membershipId: memberRank.destinyUserInfo.membershipId,
          rank: memberRank.rank,
          element: (
            <li key={memberRank.destinyUserInfo.membershipId}>
              <div className='col'>
                <div className='rank'>{memberRank.rank}</div>
              </div>
              <div className='col'>
                <MemberLink {...memberRank.destinyUserInfo} displayClan />
              </div>
              <div className='col'>
                <div className='triumphScore'>{memberRank.triumphScore.toLocaleString()}</div>
              </div>
            </li>
          )
        });
      }

      ranks = orderBy(ranks, [member => member.rank], ['asc']);

      return <ul className={cx('list', 'ranks')}>{ranks.map(member => member.element)}</ul>;
    } else {
      return <Spinner mini />
    }
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
)(Ranks);
