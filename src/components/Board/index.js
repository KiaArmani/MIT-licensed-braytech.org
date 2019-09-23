import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import { orderBy } from 'lodash';

import manifest from '../../utils/manifest';
import * as voluspa from '../../utils/voluspa';
import MemberLink from '../MemberLink';
import Spinner from '../UI/Spinner';
import Button from '../UI/Button';

import './styles.css';

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      response: []
    };
  }

  limit = 1005;
  offset = Math.floor(parseInt(this.props.offset || 0, 10) / this.limit) * this.limit;

  callVoluspa = async (offset = this.offset, limit = this.limit, type = this.props.type, metric = this.props.metric || false) => {
    try {
      let requests = [];

      if (type === 'group') {
        requests.push(voluspa.leaderboardGroup(metric));
      } else {
        requests.push(voluspa.leaderboard(metric, offset, limit));
      }

      if (this.props.member.membershipId) {
        requests.push(voluspa.leaderboardPosition(this.props.member.membershipType, this.props.member.membershipId));
      }

      let [leaderboard, leaderboardPosition] = await Promise.all(requests);

      if (!leaderboard) {
        throw Error;
      }
      this.setState((prevState, props) => {
        prevState.loading = false;
        // prevState.response = prevState.response.concat(response.data);
        prevState.response = {
          ...leaderboard,
          leaderboardPosition: leaderboardPosition ? leaderboardPosition.data : false
        };
        //console.log(prevState.response);
        return prevState;
      });
    } catch (e) {
      this.setState((prevState, props) => {
        prevState.loading = false;
        prevState.error = true;
        return prevState;
      });
    }
    // console.log(this.data);
  };

  componentDidMount() {
    this.callVoluspa();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.offset !== this.props.offset) {
      const prevDisplayOffset = parseInt(prevProps.offset, 10) || 0;
      const displayOffset = parseInt(this.props.offset, 10) || 0;

      if (Math.floor(prevDisplayOffset / this.limit) * this.limit !== Math.floor(displayOffset / this.limit) * this.limit) {
        this.offset = Math.floor(displayOffset / this.limit) * this.limit;
        this.setState({ loading: true });
        this.callVoluspa();
      }
    }
  }

  render() {
    const { t, type = 'leaderboard', metric = 'triumphScore', focusOnly = false } = this.props;

    const displayOffset = parseInt(this.props.offset, 10) || 0;
    const displayLimit = parseInt(this.props.limit, 10) || 20;

    // console.log(displayOffset % this.limit, (displayOffset % this.limit) + 20)

    if (!this.state.loading) {
      let rows = [];

      let cols = [
        {
          class: 'triumphScore',
          focus: metric === 'triumphScore',
          name: (
            <>
              <div className='full'>Triumph score</div>
              <div className='abbr'>Score</div>
            </>
          ),
          value: null
        },
        {
          class: 'collectionTotal',
          focus: metric === 'collectionTotal',
          name: (
            <>
              <div className='full'>Collection total</div>
              <div className='abbr'>Collection</div>
            </>
          ),
          value: null
        },
        {
          class: 'timePlayed',
          focus: metric === 'timePlayed',
          name: (
            <>
              <div className='full'>Time played</div>
              <div className='abbr'>Played</div>
            </>
          ),
          value: null
        }
      ];

      cols = orderBy(cols, [c => c.focus], ['desc']);

      if (!this.state.error) {
        if (type === 'group') {
          let rowsTemp = this.state.response.data.slice();
          rowsTemp = orderBy(rowsTemp, [row => (row.triumphScore ? row.triumphScore : 0), row => row.destinyUserInfo.displayName.toString().toLowerCase()], ['desc', 'asc']);

          rowsTemp.forEach((m, i) => {
            let timePlayed = Math.floor(m.destinyUserInfo.timePlayed / 1440);

            rows.push({
              el: (
                <li key={m.destinyUserInfo.membershipType + m.destinyUserInfo.membershipId} className='row'>
                  <ul>
                    <li className='col rank'>{i + 1}</li>
                    <li className='col member'>
                      <MemberLink type={m.destinyUserInfo.membershipType} id={m.destinyUserInfo.membershipId} groupId={m.destinyUserInfo.groupId} displayName={m.destinyUserInfo.displayName} />
                    </li>
                    {!m.destinyUserInfo.wasPrivate && m.destinyUserInfo.lastScraped ? (
                      <>
                        <li className='col triumphScore focus'>{m.triumphScore.toLocaleString('en-us')}</li>
                        <li className='col collectionTotal'>{m.collectionTotal.toLocaleString('en-us')}</li>
                        <li className='col timePlayed'>
                          {timePlayed} {timePlayed === 1 ? t('day') : t('days')}
                        </li>
                      </>
                    ) : (
                      <>
                        <li className='col triumphScore focus'>–</li>
                        <li className='col collectionTotal'>–</li>
                        <li className='col timePlayed'>–</li>
                      </>
                    )}
                  </ul>
                </li>
              )
            });
          });
        } else {
          this.state.response.data
            .filter(m => !m.destinyUserInfo.wasPrivate)
            .slice(displayOffset % this.limit, (displayOffset % this.limit) + displayLimit)
            .forEach((m, i) => {

            let timePlayed = Math.floor(m.destinyUserInfo.timePlayed / 1440);

            rows.push({
              rank: m.rank,
              type: m.destinyUserInfo.membershipType,
              id: m.destinyUserInfo.membershipId,
              el: (
                <li key={m.destinyUserInfo.membershipType + m.destinyUserInfo.membershipId} className='row'>
                  <ul>
                    <li className='col rank'>{m.rank.toLocaleString('en-us')}</li>
                    <li className='col member'>
                      <MemberLink type={m.destinyUserInfo.membershipType} id={m.destinyUserInfo.membershipId} groupId={m.destinyUserInfo.groupId} displayName={m.destinyUserInfo.displayName} />
                    </li>
                    {cols.map((c, o) => {
                      if (focusOnly && !c.focus) {
                        return null;
                      }

                      let value;
                      if (c.class === 'collectionTotal') {
                        value = m.collectionTotal.toLocaleString('en-us');
                      } else if (c.class === 'timePlayed') {
                        value = `${timePlayed} ${timePlayed === 1 ? t('day') : t('days')}`;
                      } else {
                        value = m.triumphScore.toLocaleString('en-us');
                      }

                      return (
                        <li key={o} className={cx('col', c.class, { focus: c.focus })}>
                          {value}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              )
            });
          });
        }
      } else {
        rows.push({
          el: (
            <li key='error-row' className='row error'>
              <ul>
                <li className='col'>Looks like something went wrong. We'll be right back.</li>
              </ul>
            </li>
          )
        });
      }

      if (type !== 'group' && this.state.response.leaderboardPosition) {
        let m = this.state.response.leaderboardPosition;
        let timePlayed = Math.floor(m.destinyUserInfo.timePlayed / 1440);

        if (!rows.find(r => r.type === m.destinyUserInfo.membershipType && r.id === m.destinyUserInfo.membershipId)) {
          rows.unshift({
            rank: m.ranks[metric],
            type: m.destinyUserInfo.membershipType,
            id: m.destinyUserInfo.membershipId,
            self: true,
            el: (
              <li key={m.destinyUserInfo.membershipType + m.destinyUserInfo.membershipId} className='row'>
                <ul>
                  <li className='col rank'>{m.ranks[metric].toLocaleString('en-us')}</li>
                  <li className='col member'>
                    <MemberLink type={m.destinyUserInfo.membershipType} id={m.destinyUserInfo.membershipId} groupId={m.destinyUserInfo.groupId} displayName={m.destinyUserInfo.displayName} />
                  </li>
                  {cols.map((c, o) => {
                    if (focusOnly && !c.focus) {
                      return null;
                    }

                    let value;
                    if (c.class === 'collectionTotal') {
                      value = m.collectionTotal.toLocaleString('en-us');
                    } else if (c.class === 'timePlayed') {
                      value = `${timePlayed} ${timePlayed === 1 ? t('day') : t('days')}`;
                    } else {
                      value = m.triumphScore.toLocaleString('en-us');
                    }

                    return (
                      <li key={o} className={cx('col', c.class, { focus: c.focus })}>
                        {value}
                      </li>
                    );
                  })}
                </ul>
              </li>
            )
          });

          rows = orderBy(rows, [r => r.rank], ['asc']);
        }
      }

      if (type === 'group') {
        rows.unshift({
          el: (
            <li key='header-row' className='row header'>
              <ul>
                <li className='col rank' />
                <li className='col member'>Member</li>
                <li className='col triumphScore'>
                  <div className='full'>Triumph score</div>
                  <div className='abbr'>Score</div>
                </li>
                <li className='col collectionTotal'>
                  <div className='full'>Collection total</div>
                  <div className='abbr'>Collection</div>
                </li>
                <li className='col timePlayed'>
                  <div className='full'>Time played</div>
                  <div className='abbr'>Played</div>
                </li>
              </ul>
            </li>
          )
        });
      } else {
        rows.unshift({
          el: (
            <li key='header-row' className='row header'>
              <ul>
                <li className='col rank' />
                <li className='col member'>Member</li>
                {cols.map(c => {
                  if (focusOnly && !c.focus) {
                    return null;
                  }

                  return (
                    <li key={c.class} className={cx('col', c.class, { focus: c.focus })}>
                      {c.name}
                    </li>
                  );
                })}
              </ul>
            </li>
          )
        });
      }

      return (
        <div className={cx('board', { group: type === 'group', 'focus-only': focusOnly })}>
          <ul className='list'>{rows.map(r => r.el)}</ul>
          {!this.state.error && type !== 'group' ? (
            <div className='pages'>
              {type === 'top20' ? (
                <>
                  <Button classNames='next' text='View leaderboard' disabled={false} anchor to={`/leaderboards/for/${metric}`} />
                </>
              ) : (
                <>
                  <Button classNames='previous' text='Previous page' disabled={displayOffset === 0 ? true : false} anchor to={`/leaderboards/for/${metric}${displayOffset > displayLimit ? `/${displayOffset - displayLimit}` : ''}`} />
                  <Button classNames='next' text='Next page' disabled={false} anchor to={`/leaderboards/for/${metric}/${displayOffset + displayLimit}`} />
                  <div className='total'>
                    <span>{(displayOffset + displayLimit + (rows.find(r => r.self) ? 1 : 0)).toLocaleString('en-us')}</span>
                    <span>of {this.state.response.results.toLocaleString('en-us')}</span>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      );
    } else {
      return <Spinner />;
    }
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
)(Board);
