import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import './styles.css';

import Root from './Root/';
import Leaderboard from './Board/';

class Leaderboards extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.dom !== this.props.match.params.dom) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const { t, member } = this.props;

    const view = this.props.match.params.view || false;
    const dom = this.props.match.params.dom || false;
    const sub = this.props.match.params.sub || false;

    // triumphs, collections, time-played
    if (view === 'for') {
      return <Leaderboard type='leaderboard' metric={dom} offset={sub} />;

    // a particular clan (groupId)
    } else if (view === 'group') {
      return <Leaderboard type='group' metric={dom} offset={sub} />;
      
    // tracking stats, top 10s
    } else {
      return <Root />;
    }
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
)(Leaderboards);
