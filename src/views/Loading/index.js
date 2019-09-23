import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import packageJSON from '../../../package.json';
import Spinner from '../../components/UI/Spinner';
import { ReactComponent as Logo } from '../../components/BraytechDevice.svg';

import './styles.css';

class Loading extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  loadingStates = {
    error: {
      isError: true,
      status: 'Fatal error',
      displayProperties: {
        name: 'Unknown error',
        description: 'Something very unexpected and unrecoravable occurred.\n\nPlease help @justrealmilk resolve this issue by messaging him.'
      }
    },
    error_setUpManifest: {
      isError: true,
      status: 'Fatal error',
      displayProperties: {
        name: 'Manifest error',
        description: 'Something went wrong while trying to update the item manifest.\n\nPlease refresh the app and try again. If this issue persists, please contact @justrealmilk.'
      }
    },
    error_fetchingManifest: {
      isError: true,
      status: 'Fatal error',
      displayProperties: {
        name: 'Manifest download failed',
        description: 'Something went wrong while trying to download the item manifest from Bungie.\n\nPlease refresh the app and try again. If this issue persists, please contact @justrealmilk.'
      }
    },
    error_maintenance: {
      shh: true,
      status: ' ',
      displayProperties: {
        name: 'Bungie Maintenance',
        description: 'The Bungie API is currently down for maintenance.\n\nTune into @BungieHelp on Twitter for more information.'
      }
    },
    checkManifest: {
      status: 'Verifying data'
    },
    fetchManifest: {
      status: 'Downloading from Bungie'
    },
    setManifest: {
      status: 'Saving'
    },
    loadingPreviousProfile: {
      status: 'Loading previous member'
    },
    loadingProfile: {
      status: 'Loading member'
    },
    else: {
      status: 'Starting Windows 95'
    }
  };

  componentDidMount() {}

  componentDidUpdate(prevProps) {
    if (prevProps.state !== this.props.state) {
      const state = this.props.state;

      if (this.loadingStates[state.code] && (this.loadingStates[state.code].isError || this.loadingStates[state.code].shh)) {
        this.props.pushNotification({
          error: true,
          date: new Date().toISOString(),
          expiry: 86400000,
          displayProperties: this.loadingStates[state.code] && this.loadingStates[state.code].displayProperties,
          javascript: state.detail
        });
      }
    }
  }

  render() {
    const { t, state } = this.props;

    if (state.code) {
      const status = (this.loadingStates[state.code] && this.loadingStates[state.code].status) || this.loadingStates.else.status;
      const isError = this.loadingStates[state.code] && (this.loadingStates[state.code].isError || this.loadingStates[state.code].shh);

      return (
        <div className={cx('view')} id='loading'>
          <div className='bg' />
          <div className='logo-feature'>
            <div className='device'>
              <Logo />
            </div>
          </div>
          <div className='text'>
            <div className='version'>Braytech {packageJSON.version}</div>
            <div className={cx('status', { error: isError })}>
              {!isError ? (
                <div>
                  <Spinner mini dark />
                </div>
              ) : null}
              <div>{t(status)}</div>
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    pushNotification: value => {
      dispatch({ type: 'PUSH_NOTIFICATION', payload: value });
    }
  };
}

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withNamespaces()
)(Loading);
