import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import './styles.css';

import Root from './Root/';
import Crucible from './Crucible/';
import Gambit from './Gambit/';
import Raids from './Raids/';
import Strikes from './Strikes/';

class PGCRs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    
  }

  render() {
    const { t, member } = this.props;
    const type = this.props.match.params.type || false;
    const mode = this.props.match.params.mode || false;

    if (type === 'crucible') {
      return <Crucible mode={mode} RebindTooltips={this.props.RebindTooltips} />;
    } else if (type === 'gambit') {
      return <Gambit mode={mode} RebindTooltips={this.props.RebindTooltips} />;
    } else if (type === 'raids') {
      return <Raids mode={mode} RebindTooltips={this.props.RebindTooltips} />;
    } else if (type === 'strikes') {
      return <Strikes mode={mode} RebindTooltips={this.props.RebindTooltips} />;
    } else {
      return <Root RebindTooltips={this.props.RebindTooltips} />;
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
)(PGCRs);
