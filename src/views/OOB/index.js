import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import './styles.css';

class OOB extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);

    document.querySelectorAll('*').forEach(el => {
      el.addEventListener('touchstart', this.cancelAction);
      el.addEventListener('click', this.cancelAction);
    })
  }

  cancelAction = e => {
    e.stopPropagation();
    e.preventDefault();
  }

  render() {
    const { t } = this.props;

    return (
      <div className={cx('view', this.props.theme.selected)} id='oob'>
        <div className='module intro'>
          <div className='page-header'>
            <div className='name'>{t('Out of bounds')}</div>
            <div className='description'>{t("You shouldn't be here 👀")}</div>
          </div>
          <div className='text'>
            <p>This web site is intended to be viewed from your web browser, not from some shitty 2 minute app that slaps an advertisment on the bottom.</p>
            <p>This is unlawful appropriation and violates both my heart and a handful of the pillars Braytech is based upon including quality and an ad-free experience.</p>
            <p>Should I ever decide to venture into native app building, there shall be much fanfare. Today is not that day.</p>
            <p>Pointer actions are disabled. Please uninstall this application from your device and use your web browser to access this web site.</p>
          </div>
        </div>
      </div>
    );
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
)(OOB);
