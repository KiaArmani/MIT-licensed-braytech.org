import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import cx from 'classnames';
import ReactGA from 'react-ga';

import ObservedImage from '../../ObservedImage';
import Button from '../../UI/Button';

import './styles.css';

class NotificationLink extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
    this.mounted = false;
  }

  componentWillMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  deactivateOverlay = e => {
    e.stopPropagation();

    let state = this.active && this.active.length ? this.active[0] : false;

    if (this.mounted) {
      this.props.popNotification(state.id);

      ReactGA.event({
        category: 'notification',
        action: 'dismiss'
      });
    }
  };

  componentDidMount() {
    
  }

  render() {
    const { t } = this.props;
    
    const timeNow = new Date().getTime();

    this.active = this.props.notifications && this.props.notifications.objects.length ? this.props.notifications.objects.filter(o => {
      let objDate = new Date(o.date).getTime();
      if (objDate + o.expiry > timeNow) {
        return true;
      } else {
        return false;
      }
    }) : false;

    if (this.active && this.active.length ? this.active[0] : false) {
      const state = this.active[0];

      let isError, image;
      if (state && state.error && state.javascript.message === 'maintenance') {
        image = '/static/images/extracts/ui/01A3-00001EE8.PNG';
      } else if (state && state.error) {
        isError = true;
        image = '/static/images/extracts/ui/010A-00000552.PNG';
      } else if (state.displayProperties && state.displayProperties.image) {
        image = state.displayProperties.image;
      } else {
        image = '/static/images/extracts/ui/010A-00000554.PNG';
      }

      return (
        <div id='notification-overlay' className={cx({ error: isError  })}>
          <div className='wrapper-outer'>
            <div className='background'>
              <div className='border-top' />
              <div className='acrylic' />
            </div>
            <div className={cx('wrapper-inner', { 'has-image': state.displayProperties && state.displayProperties.image })}>
              <div>
                <div className='icon'>
                  <ObservedImage className='image' src={image} />
                </div>
              </div>
              <div>
                <div className='text'>
                  <div className='name'>{state.displayProperties && state.displayProperties.name ? state.displayProperties.name : 'Unknown'}</div>
                  <div className='description'>{state.displayProperties && state.displayProperties.description ? <ReactMarkdown source={state.displayProperties.description} /> : 'Unknown'}</div>
                </div>
              </div>
            </div>
            <div className='sticky-nav mini ultra-black'>
              <div className='sticky-nav-inner'>
                <div />
                <ul>
                  <li>
                    <Button action={this.deactivateOverlay}>
                      <i className='destiny-B_Button' /> {t('Dismiss')}
                    </Button>
                  </li>
                </ul>
              </div>
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
  return {
    notifications: state.notifications
  };
}

function mapDispatchToProps(dispatch) {
  return {
    popNotification: value => {
      dispatch({ type: 'POP_NOTIFICATION', payload: value });
    }
  };
}

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withNamespaces()
)(NotificationLink);
