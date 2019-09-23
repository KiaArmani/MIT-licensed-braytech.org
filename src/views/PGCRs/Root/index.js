import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import * as bungie from '../../../utils/bungie';

import { ProfileNavLink } from '../../../components/ProfileLink';
import Spinner from '../../../components/UI/Spinner';
import Mode from '../../../components/PGCRs/Mode';
import Matches from '../../../components/PGCRs/Matches';

class All extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  componentDidMount() {
    
  }

  render() {
    const { t, member } = this.props;
    const characterId = member.characterId;

    return (
      <div className={cx('view', 'root')} id='multiplayer'>
        <div className='module-l1'>
          <div className='module-l2'>
            <div className='content head'>
              <div className='page-header'>
                <div className='name'>{t('Post Game Carnage Reports')}</div>
              </div>
              <div className='text'>
                <p>{t('You know, in case you missed the match summary screen while you were busy being awesome. These views will check for fresh games every 30 seconds.')}</p>
                <p>{t("Like most aspects of Bungie's API, PGCRs are complicated, and as such it will take some time to work out the kinks and to understand how to best handle different game modes.")}</p>
              </div>
            </div>
          </div>
          <div className='module-l2'>
            <div className='sub-header'>
              <div>Activities</div>
            </div>
            <div className='content views'>
              <ul className='list'>
                <li className='linked'>
                  <ProfileNavLink to='/pgcrs' exact>{t('All')}</ProfileNavLink>
                </li>
                <li className='linked'>
                  <ProfileNavLink to='/pgcrs/crucible'>{t('Crucible')}</ProfileNavLink>
                </li>
                <li className='linked'>
                  <ProfileNavLink to='/pgcrs/gambit'>{t('Gambit')}</ProfileNavLink>
                </li>
                <li className='linked'>
                  <ProfileNavLink to='/pgcrs/raids'>{t('Raids')}</ProfileNavLink>
                </li>
                <li className='linked'>
                  <ProfileNavLink to='/pgcrs/strikes'>{t('Strikes')}</ProfileNavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className='module-l1' id='matches'>
          <div className='content'>
            <div className='sub-header'>
              <div>Recent activities</div>
            </div>
            <Matches modes={false} characterId={member.characterId} RebindTooltips={this.props.RebindTooltips} />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    PGCRcache: state.PGCRcache
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(All);
