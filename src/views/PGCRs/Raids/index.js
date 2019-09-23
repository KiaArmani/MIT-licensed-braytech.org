import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import * as bungie from '../../../utils/bungie';

import manifest from '../../../utils/manifest';
import { ProfileNavLink } from '../../../components/ProfileLink';
import ProgressBar from '../../../components/UI/ProgressBar';
import Spinner from '../../../components/UI/Spinner';
import Mode from '../../../components/PGCRs/Mode';
import Matches from '../../../components/PGCRs/Matches';

class Raids extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  raids = {
    all: {
      modes: [4],
      stats: {
        raid: {
          mode: 4
        }
      }
    }
  };

  fetch = async () => {
    const { member } = this.props;

    this.setState(p => {
      p.loading = true;
      return p;
    });

    let stats = await bungie.getHistoricalStats(member.membershipType, member.membershipId, member.characterId, '1', this.raids.all.modes, '0');

    for (const mode in stats) {
      if (stats.hasOwnProperty(mode)) {
        if (!stats[mode].allTime) {
          return;
        }
        Object.entries(stats[mode].allTime).forEach(([key, value]) => {
          this.raids.all.stats[mode][key] = value;
        });
      }
    }

    this.setState(p => {
      p.loading = false;
      return p;
    });

    return true;
  };

  componentDidMount() {
    this.refreshData();
    this.startInterval();
  }

  refreshData = async () => {
    if (!this.state.loading) {
      //console.log('refresh start');
      await this.fetch();
      //console.log('refresh end');
    } else {
      //console.log('refresh skipped');
    }
  };

  startInterval() {
    this.refreshDataInterval = window.setInterval(this.refreshData, 30000);
  }

  clearInterval() {
    window.clearInterval(this.refreshDataInterval);
  }

  componentWillUnmount() {
    this.clearInterval();
  }

  render() {
    const { t, member } = this.props;
    const characterId = member.characterId;

    return (
      <div className={cx('view', 'gambit')} id='multiplayer'>
        <div className='module-l1'>
          <div className='module-l2'>
            <div className='content head'>
              <div className='page-header'>
                <div className='sub-name'>{t('Post Game Carnage Reports')}</div>
                <div className='name'>{t('Raids')}</div>
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
          <div className='module-l2'>
            <div className='content'>
              <div className='sub-header'>
                <div>Modes</div>
              </div>
              {Object.values(this.raids.all.stats.raid).length > 1 ? (
                <ul className='list modes'>
                  {Object.values(this.raids.all.stats).map(m => {
                    let paramsMode = this.props.mode ? parseInt(this.props.mode) : 4;
                    let isActive = (match, location) => {
                      if (paramsMode === m.mode) {
                        return true;
                      } else {
                        return false;
                      }
                    };

                    return <Mode key={m.mode} stats={m} isActive={isActive} root='/pgcrs/raids' defaultMode='4' />;
                  })}
                </ul>
              ) : (
                <Spinner mini />
              )}
            </div>
          </div>
        </div>
        <div className='module-l1' id='matches'>
          <div className='content'>
            <div className='sub-header'>
              <div>Recent raids</div>
            </div>
            <Matches modes={[this.props.mode ? parseInt(this.props.mode) : 4]} characterId={member.characterId} RebindTooltips={this.props.RebindTooltips} />
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
)(Raids);
