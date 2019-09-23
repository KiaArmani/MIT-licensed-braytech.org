import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import { ProfileLink } from '../../components/ProfileLink';

import './styles.css';

import Root from './Root/';
import Node from './Node/';
import BadgeNode from './BadgeNode/';

class Collections extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    if (!this.props.match.params.quaternary) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const { t } = this.props;
    let primaryHash = this.props.match.params.primary ? this.props.match.params.primary : false;

    let backLinkPath = this.props.location.state && this.props.location.state.from ? this.props.location.state.from : '/collections';

    if (!primaryHash) {
      return (
        <div className={cx('view', 'presentation-node', 'root')} id='collections'>
          <Root {...this.props} />
        </div>
      );
    } else if (primaryHash === 'badge') {
      return (
        <>
          <div className={cx('view', 'presentation-node')} id='collections'>
            <BadgeNode {...this.props} />
          </div>
          <div className='sticky-nav'>
            <div />
            <ul>
              <li>
                <ProfileLink className='button' to={backLinkPath}>
                  <i className='destiny-B_Button' />
                  {t('Back')}
                </ProfileLink>
              </li>
            </ul>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className={cx('view', 'presentation-node')} id='collections'>
            <Node {...this.props} primaryHash={primaryHash} />
          </div>
          <div className='sticky-nav'>
            <div />
            <ul>
              <li>
                <ProfileLink className='button' to={backLinkPath}>
                  <i className='destiny-B_Button' />
                  {t('Back')}
                </ProfileLink>
              </li>
            </ul>
          </div>
        </>
      );
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
)(Collections);
