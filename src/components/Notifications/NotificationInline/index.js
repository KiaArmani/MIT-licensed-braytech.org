import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

// import manifest from '../../utils/manifest';
// import ObservedImage from '../ObservedImage';
// import { ProfileLink } from '../ProfileLink';

import './styles.css';

class NotificationInline extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, name, description, type } = this.props;

    return (
      <div className={cx('notification-inline', { [type]: type })}>
        <div className='name'>{name}</div>
        <div className='description'>{description}</div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(NotificationInline);
