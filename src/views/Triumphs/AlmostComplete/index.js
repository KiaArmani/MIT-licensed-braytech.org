import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

import RecordsAlmost from '../../../components/RecordsAlmost';

class Root extends React.Component {
  render() {
    const { t } = this.props;

    return (
      <>
        <div className='almost-complete'>
          <div className='sub-header sub'>
            <div>{t('Almost complete')}</div>
          </div>
          <RecordsAlmost {...this.props} limit='100' selfLinkFrom='/triumphs/almost-complete' />
        </div>
      </>
    );
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
)(Root);
