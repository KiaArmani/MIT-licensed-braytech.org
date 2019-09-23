import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

import Checkbox from '../../components/UI/Checkbox';
import Button from '../../components/UI/Button';
import { getLanguageInfo } from '../../utils/languageInfo';
import * as ls from '../../utils/localStorage';

import './styles.css';

class Settings extends React.Component {
  constructor(props) {
    super(props);

    let initLanguage = this.props.i18n.getCurrentLanguage();

    this.state = {
      language: {
        current: initLanguage,
        selected: initLanguage
      }
    };

    this.saveAndRestart = this.saveAndRestart.bind(this);
  }

  selectCollectibleDisplayState(state) {
    let currentState = this.props.collectibles;
    let newState = currentState;

    // if (state === 'showAll') {
    //   newState = {
    //     hideTriumphRecords: false,
    //     hideChecklistItems: false
    //   };
    // } else {
    newState = {
      hideTriumphRecords: state === 'hideTriumphRecords' ? !currentState.hideTriumphRecords : currentState.hideTriumphRecords,
      hideChecklistItems: state === 'hideChecklistItems' ? !currentState.hideChecklistItems : currentState.hideChecklistItems,
      hideInvisibleCollectibles: state === 'hideInvisibleCollectibles' ? !currentState.hideInvisibleCollectibles : currentState.hideInvisibleCollectibles
    };
    // }

    this.props.setCollectibleDisplayState(newState);
  }

  selectLanguage(lang) {
    let temp = this.state.language;
    temp.selected = lang;
    this.setState(temp);
  }

  saveAndRestart() {
    console.log(this);
    const { i18n } = this.props;
    i18n.setCurrentLanguage(this.state.language.selected);
    setTimeout(() => {
      window.location.reload();
    }, 50);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentWillUnmount() {}

  render() {
    const { t, availableLanguages } = this.props;

    const complete = ['en', 'de', 'pt-br'];
    let languageButtons = availableLanguages.map(code => {
      let langInfo = getLanguageInfo(code);
      return (
        <li
          key={code}
          onClick={() => {
            this.selectLanguage(code);
          }}
        >
          <Checkbox linked checked={this.state.language.selected === code} text={langInfo.name || langInfo.code} />
        </li>
      );
    });

    let collectiblesButtons = (
      <>
        <li
          key='hideTriumphRecords'
          onClick={() => {
            this.selectCollectibleDisplayState('hideTriumphRecords');
          }}
        >
          <Checkbox linked checked={this.props.collectibles.hideTriumphRecords} text={t('Hide completed triumphs')} />
        </li>
        <li
          key='hideChecklistItems'
          onClick={() => {
            this.selectCollectibleDisplayState('hideChecklistItems');
          }}
        >
          <Checkbox linked checked={this.props.collectibles.hideChecklistItems} text={t('Hide completed checklist items')} />
        </li>
        <li
          key='hideInvisibleCollectibles'
          onClick={() => {
            this.selectCollectibleDisplayState('hideInvisibleCollectibles');
          }}
        >
          <Checkbox linked checked={this.props.collectibles.hideInvisibleCollectibles} text={t('Hide invisible Collection items')} />
        </li>
      </>
    );

    return (
      <div className='view' id='settings'>
        <div className='module head'>
          <div className='page-header'>
            <div className='name'>{t('Settings')}</div>
          </div>
        </div>
        <div className='padder'>
          <div className='module'>
            <div className='sub-header sub'>
              <div>{t('Theme')}</div>
            </div>
            <ul className='list settings'>
              <li
                key='light'
                onClick={() => {
                  this.props.setTheme('light-mode');
                }}
              >
                <Checkbox linked checked={this.props.theme.selected === 'light-mode'} text={t('Lights on')} />
              </li>
              <li
                key='dark'
                onClick={() => {
                  this.props.setTheme('dark-mode');
                }}
              >
                <Checkbox linked checked={this.props.theme.selected === 'dark-mode'} text={t('Lights off')} />
              </li>
            </ul>
          </div>
          <div className='module'>
            <div className='sub-header sub'>
              <div>{t('Tooltips')}</div>
            </div>
            <ul className='list settings'>
              <li
                key='simple'
                onClick={() => {
                  this.props.setTooltipDetailMode(false);
                }}
              >
                <Checkbox linked checked={!this.props.tooltips.detailedMode} text={t('Simple')} />
              </li>
              <li
                key='detailed'
                onClick={() => {
                  this.props.setTooltipDetailMode(true);
                }}
              >
                <Checkbox linked checked={this.props.tooltips.detailedMode} text={t('Detailed')} />
              </li>
            </ul>
          </div>
          <div className='module'>
            <div className='sub-header sub'>
              <div>{t('Collectibles')}</div>
            </div>
            <ul className='list settings'>{collectiblesButtons}</ul>
          </div>
          <div className='module'>
            <div className='sub-header sub'>
              <div>{t('Language')}</div>
            </div>
            <ul className='list settings'>{languageButtons}</ul>
            <Button text={t('Save and restart')} invisible={this.state.language.current === this.state.language.selected} action={this.saveAndRestart} />
          </div>
          <div className='module'>
            <div className='sub-header sub'>
              <div>{t('Local saved data')}</div>
            </div>
            <div className='buttons'>
              <Button text={t('Clear profile history')} action={() => { ls.set('history.profiles', []) }} />
              <Button text={t('Clear tracked triumphs')} action={() => { this.props.setTrackedTriumphs([]) }} />
              <Button text={t('Reset notifications')} action={() => { ls.set('history.notifications', []) }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    theme: state.theme,
    tooltips: state.tooltips,
    collectibles: state.collectibles
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setTheme: value => {
      dispatch({ type: 'SET_THEME', payload: value });
    },
    setTooltipDetailMode: value => {
      dispatch({ type: 'SET_TOOLTIPS', payload: { detailedMode: value } });
    },
    setCollectibleDisplayState: value => {
      dispatch({ type: 'SET_COLLECTIBLES', payload: value });
    },
    setTrackedTriumphs: value => {
      dispatch({ type: 'SET_TRACKED_TRIUMPHS', payload: value });
    }
  };
}

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withNamespaces()
)(Settings);
