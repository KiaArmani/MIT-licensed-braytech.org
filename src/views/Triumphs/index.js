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
import SealNode from './SealNode/';
import AlmostComplete from './AlmostComplete/';
import Tracked from './Tracked/';

class Triumphs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.toggleCompleted = this.toggleCompleted.bind(this);
  }

  toggleCompleted = () => {
    let currentState = this.props.collectibles;
    let newState = {
      hideTriumphRecords: !currentState.hideTriumphRecords,
      hideChecklistItems: currentState.hideChecklistItems
    };

    this.props.setCollectibleDisplayState(newState);
  };

  componentDidMount() {
    if (!this.props.match.params.quaternary) {
      window.scrollTo(0, 0);
    }
  }

  componentDidUpdate(prevProps) {
    if ((!this.props.match.params.quaternary && prevProps.location.pathname !== this.props.location.pathname) || (!prevProps.match.params.quaternary && this.props.location.pathname === '/triumphs/almost-complete' && prevProps.location.pathname !== this.props.location.pathname)) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const { t } = this.props;
    let primaryHash = this.props.match.params.primary ? this.props.match.params.primary : false;

    let toggleCompletedLink = (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a className='button' onClick={this.toggleCompleted}>
        {this.props.collectibles.hideTriumphRecords ? (
          <>
            <i className='uniF16E' />
            {t('Show all')}
          </>
        ) : (
          <>
            <i className='uniF16B' />
            {t('Hide redeemed')}
          </>
        )}
      </a>
    );

    let backLinkPath = this.props.location.state && this.props.location.state.from ? this.props.location.state.from : '/triumphs';

    if (!primaryHash) {
      return (
        <div className={cx('view', 'presentation-node', 'root')} id='triumphs'>
          <Root {...this.props} />
        </div>
      );
    } else if (primaryHash === 'seal') {
      return (
        <>
          <div className={cx('view', 'presentation-node')} id='triumphs'>
            <SealNode {...this.props} />
          </div>
          <div className='sticky-nav'>
            <div />
            <ul>
              <li>{toggleCompletedLink}</li>
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
    } else if (primaryHash === 'almost-complete') {
      return (
        <>
          <div className={cx('view')} id='triumphs'>
            <AlmostComplete {...this.props} />
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
    } else if (primaryHash === 'tracked') {
      return (
        <>
          <div className={cx('view')} id='triumphs'>
            <Tracked {...this.props} />
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
          <div className={cx('view', 'presentation-node', 'parent')} id='triumphs'>
            <Node {...this.props} primaryHash={primaryHash} />
          </div>
          <div className='sticky-nav'>
            <div />
            <ul>
              <li>{toggleCompletedLink}</li>
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
    member: state.member,
    collectibles: state.collectibles
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setCollectibleDisplayState: value => {
      dispatch({ type: 'SET_COLLECTIBLES', payload: value });
    }
  };
}

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withNamespaces()
)(Triumphs);
