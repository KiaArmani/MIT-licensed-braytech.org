import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import ObservedImage from '../../components/ObservedImage';
import { enumerateRecordState } from '../../utils/destinyEnums';

import './styles.css';

class Read extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      from: this.props.location.state && this.props.location.state.from ? this.props.location.state.from : false
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.kind !== prevProps.match.params.kind) {
      window.scrollTo(0, 0);
    }
  }

  recordStateCheck = e => {
    let hash = parseInt(e.currentTarget.dataset.hash, 10);
    let state = this.recordState(hash);

    if (!enumerateRecordState(state).recordRedeemed) {
      // e.preventDefault();
    } else {
    }
  };

  recordState = hash => {
    if (!this.props.member.data) {
      return 0;
    }

    const characterRecords = this.props.member.data.profile.characterRecords.data;
    const profileRecords = this.props.member.data.profile.profileRecords.data.records;
    const characterId = this.props.member.characterId;

    let state;
    if (profileRecords[hash]) {
      state = profileRecords[hash] ? profileRecords[hash].state : 0;
    } else if (characterRecords[characterId].records[hash]) {
      state = characterRecords[characterId].records[hash] ? characterRecords[characterId].records[hash].state : 0;
    } else {
      state = 0;
    }

    return state;
  };

  render() {
    const { t } = this.props;
    const kind = this.props.match.params.kind ? this.props.match.params.kind : false;
    const hash = this.props.match.params.hash ? this.props.match.params.hash : false;
    const bookCovers = {
      2447807737: '037E-0000131E.png',
      396866327: '01A3-0000132F.png',
      1420597821: '037E-00001308.png',
      648415847: '037E-00001311.png',
      335014236: '037E-00001BE0.png',
      3472295814: '0560-000000D4.png',
      3239864233: '01A3-00001330.png',
      2541573665: '01A3-00001336.png',
      3305936921: '037E-0000130D.png',
      2077211754: '0560-000000C5.png',
      655926402: '01A3-000012F4.png',
      2026987060: '037E-00001328.png',
      2325462143: '037E-00001323.png',
      2203266100: '0560-000000CF.png',
      756584948: '0560-000000CA.png',
      3148269494: '0560-00001070.png',
      2741070862: '0560-00001065.png',
      3758802814: '0560-00001060.png',
      139066480: '0560-0000105C.png',
      3762408250: '0560-00001074.png',
      289742222: '0560-0000106A.png'
    };

    let parentDefinition;
    let recordDefinition;
    let pageName;
    let content;
    if (kind === 'book') {
      parentDefinition = manifest.DestinyPresentationNodeDefinition[hash];
    } else if (kind === 'record') {
      recordDefinition = manifest.DestinyRecordDefinition[hash];
      parentDefinition = manifest.DestinyPresentationNodeDefinition[manifest.DestinyRecordDefinition[hash].presentationInfo.parentPresentationNodeHashes[0]];
    } else {
    }

    if (kind === 'book') {
      pageName = false;
      content = (
        <ul className={cx('list')}>
          {parentDefinition.children.records.map(entry => {
            let definition = manifest.DestinyRecordDefinition[entry.recordHash];
            if (!definition.loreHash) {
              return null;
            }
            let state = this.recordState(entry.recordHash);
            return (
              <li key={entry.recordHash} className={cx('linked')}>
                <Link to={`/read/record/${entry.recordHash}`} onClick={this.recordStateCheck} data-hash={entry.recordHash}>
                  {!enumerateRecordState(state).recordRedeemed ? '???' : definition.displayProperties.name}
                </Link>
              </li>
            );
          })}
        </ul>
      );
    } else if (kind === 'record') {
      let loreHash = recordDefinition.loreHash;
      const loreDefininition = manifest.DestinyLoreDefinition[loreHash];

      pageName = loreDefininition.displayProperties.name;
      content = <div className='text'>{loreDefininition.displayProperties.description}</div>;
    } else {
    }

    let backLinkPath = this.state.from;

    return (
      <div className={cx('view', 'dark-mode', kind)} id='read'>
        <div className='bg' />
        <div className='wrap'>
          <div className='flair left' />
          <div className='flair right' />
          <div className={cx('page-name', { null: !pageName })}>
            <span className='quote-l' />
            <span>{pageName}</span>
            <span className='quote-r' />
          </div>
          <div className='pair'>
            <div className='nav'>
              <div className='sticky'>
                <div className={cx('display', kind)}>
                  <div className='cover'>
                    <ObservedImage className='image' src={`/static/images/extracts/books/${bookCovers[parentDefinition.hash]}`} />
                  </div>
                  <div className='ui'>
                    <div className='book-name'>{parentDefinition.displayProperties.name}</div>
                    <ul className={cx('list', { 'is-root': kind === 'book' })}>
                      <li className='linked'>
                        <Link to={`/read/book/${parentDefinition.hash}`}>{t('All pages')}</Link>
                      </li>
                      <li className='linked'>
                        <a href={`https://www.ishtar-collective.net/entries/${recordDefinition ? recordDefinition.loreHash : ''}`} target='_blank' rel='noopener noreferrer'>
                          <span className='destiny-ishtar' />
                          Go to Ishtar
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className='dots' />
              </div>
            </div>
            <div className='content'>{content}</div>
          </div>
        </div>
        {kind === 'record' || backLinkPath ? (
          <div className='sticky-nav'>
            <div />
            <ul>
              {kind === 'record' ? (
                <li>
                  <Link className='button' to={`/read/book/${parentDefinition.hash}`}>
                    <i className='destiny-Y_Button' />
                    {t('All pages')}
                  </Link>
                </li>
              ) : null}
              {backLinkPath ? (
                <li>
                  <Link className='button' to={backLinkPath}>
                    <i className='destiny-B_Button' />
                    {t('Dismiss')}
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    theme: state.theme,
    member: state.member
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Read);
