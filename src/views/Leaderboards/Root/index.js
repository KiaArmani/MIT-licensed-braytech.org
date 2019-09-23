import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import Moment from 'react-moment';

import Board from '../../../components/Board';
import GroupSearch from '../../../components/GroupSearch';
import manifest from '../../../utils/manifest';

import './styles.css';

class Root extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  render() {
    const { t, member } = this.props;

    return (
      <div className={cx('view', 'root')} id='leaderboards'>
        <div className='module head'>
          <div className='content'>
            <div className='page-header'>
              <div className='name'>{t('Leaderboards')}</div>
            </div>
            <div className='split'>
              <div className='text'>
                <p>Braytech leaderboards use a dense rank and are sorted by rank in ascending order, followed by display name in ascending order.</p>
              </div>
              <div className='stats'>
                <div>
                  <div className='value'>
                    <Moment fromNow>{manifest.statistics.general.status.lastScraped}</Moment>
                  </div>
                  <div className='name'>Ranks last generated</div>
                </div>
                <div>
                  <div className='value'>{manifest.statistics.general.ranked.toLocaleString('en-us')}</div>
                  <div className='name'>Players ranked</div>
                </div>
                <div>
                  <div className='value'>{Math.floor((manifest.statistics.general.playedSeason / manifest.statistics.general.tracking) * 100)}%</div>
                  <div className='name'>Played this season</div>
                </div>
                <div>
                  <div className='value'>{manifest.statistics.general.groups.toLocaleString('en-us')}</div>
                  <div className='name'>Clans being tracked</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='padder'>
          <div className='module'>
            <div className='sub-header alt'>
              <div>{t('Triumph score')}</div>
            </div>
            <div className='content'>
              <Board type='top20' metric='triumphScore' limit='10' focusOnly />
            </div>
          </div>
          <div className='module'>
            <div className='sub-header alt'>
              <div>{t('Collection total')}</div>
            </div>
            <div className='content'>
              <Board type='top20' metric='collectionTotal' limit='10' focusOnly />
            </div>
          </div>
          <div className='module'>
            <div className='sub-header alt'>
              <div>{t('Time played')}</div>
            </div>
            <div className='content'>
              <Board type='top20' metric='timePlayed' limit='10' focusOnly />
            </div>
          </div>
          <div className='module'>
            <div className='sub-header alt'>
              <div>{t('Clans')}</div>
            </div>
            <div className='content'>
              <GroupSearch initial={member && member.data ? member.data.groups && member.data.groups.results.length ? member.data.groups.results[0].group.name : 'Braytech.org' : 'Braytech.org'} />
            </div>
          </div>
        </div>
      </div>
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
