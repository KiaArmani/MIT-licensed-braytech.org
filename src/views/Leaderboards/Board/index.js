import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import * as bungie from '../../../utils/bungie';
import Spinner from '../../../components/UI/Spinner';
import Button from '../../../components/UI/Button';
import Board from '../../../components/Board';

import './styles.css';

class Leaderboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      response: false
    };
  }

  callVoluspa = async (groupId) => {
    try {
      let response = await bungie.group(groupId);
      if (!response) {
        throw Error;
      }
      this.setState((prevState, props) => {
        prevState.loading = false;
        // prevState.response = prevState.response.concat(response.data);
        prevState.response = response;
        return prevState;
      });
      // console.log(this.data);
    } catch (e) {
      this.setState((prevState, props) => {
        prevState.loading = false;
        prevState.error = true;
        return prevState;
      });
    }
  };

  componentDidMount() {
    const { type, metric } = this.props;

    if (type === 'group' && metric) {
      this.callVoluspa(metric);
    }
  }

  render() {
    const { t, member, type, metric, offset } = this.props;

    console.log(this.state)

    let headerName;
    if (metric === 'collectionTotal') {
      headerName = t('Collection total');
    } else if (metric === 'timePlayed') {
      headerName = t('Timed played');
    } else if (type === 'group') {
      headerName = this.state.response ? this.state.response.detail.name : <Spinner />;
    } else {
      headerName = t('Triumph score');
    }

    return (
      <div className={cx('view', 'for')} id='leaderboards'>
        <div className='module'>
          <div className='content head'>
            <div className='page-header'>
              <div className='sub-name'>{t('Leaderboards')}</div>
              <div className='name'>{headerName}</div>
            </div>
            <div className='text'>
              <p>Braytech leaderboards use a dense rank and are sorted by rank in ascending order, followed by display name in ascending order.</p>
            </div>
            <Button text='Return to root' disabled={false} anchor to='/leaderboards/' />
          </div>
        </div>
        <div className='module'>
          <div className='content'>
            <Board type={type} metric={metric} offset={offset ? offset : 0} limit='15' />
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
)(Leaderboard);
