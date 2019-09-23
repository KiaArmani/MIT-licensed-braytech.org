import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import godRolls from '../../../data/godRolls';

import './styles.css';

class GodRolls extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.array = [];
  }

  componentDidMount() {
    window.scrollTo(0, 0);

    const regex = /dimwishlist:item=(.+)&perks=(.+)/gim;
    const str = godRolls.list;
    let m;

    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      this.array.push({
        itemHash: m[1],
        plugs: m[2].split(',')
      });

      // The result can be accessed through the `m`-variable.
      // m.forEach((match, groupIndex) => {

      //     console.log(`Found match, group ${groupIndex}: ${match}`);
      // });
    }
    console.log(JSON.stringify(this.array));
  }

  componentWillUnmount() {}

  render() {
    return <div className={cx('view', this.props.theme.selected)} id='god-rolls' />;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(GodRolls);
