import React from 'react';
import { withNamespaces } from 'react-i18next';

import './styles.css';

class NotificationBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      update: false
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.updateAvailable !== this.props.updateAvailable) {
      this.setState({
        update: this.props.updateAvailable
      });
    }
  }

  render() {
    const { t } = this.props;

    if (this.state.update) {
      return (
        <div id='notification-app'>
          <div>
            <strong>{t('Update available')}</strong>
            <div>{t('An update is available. You can activate it by closing all instances of Braytech.')}</div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default withNamespaces()(NotificationBar);
