import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

import RecordsTracked from '../../../components/RecordsTracked';

class Root extends React.Component {
  render() {
    const { t } = this.props;

    return (
      <>
        <div className='almost-complete'>
          <div className='sub-header sub'>
            <div>{t('Tracked triumphs')}</div>
          </div>
          <RecordsTracked {...this.props} limit='100' selfLinkFrom='/triumphs/tracked' />
        </div>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Root);
