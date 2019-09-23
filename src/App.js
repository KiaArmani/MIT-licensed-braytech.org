import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import './Core.css';
import './App.css';
import './components/PresentationNode.css';

import './utils/i18n';
import dexie from './utils/dexie';
import * as bungie from './utils/bungie';
import * as voluspa from './utils/voluspa';
import GoogleAnalytics from './components/GoogleAnalytics';
import store from './utils/reduxStore';
import manifest from './utils/manifest';
import * as ls from './utils/localStorage';

import Header from './components/UI/Header';
import Tooltip from './components/Tooltip';
import Footer from './components/UI/Footer';
import NotificationBar from './components/Notifications/NotificationBar';
import NotificationLink from './components/Notifications/NotificationLink';
import NotificationProgress from './components/Notifications/NotificationProgress';
import RefreshService from './components/RefreshService';

import ProfileRoutes from './ProfileRoutes';

import Loading from './views/Loading';
import Index from './views/Index';
import CharacterSelect from './views/CharacterSelect';
import Inspect from './views/Inspect';
import Read from './views/Read';
import Settings from './views/Settings';
import Credits from './views/Credits';
import Experiments from './views/Experiments';
import Leaderboards from './views/Leaderboards';
import FAQ from './views/FAQ';
import ClanBannerBuilder from './views/Experiments/ClanBannerBuilder';
import DataInspector from './views/Experiments/DataInspector';
import ZeroHour from './views/Experiments/ZeroHour';
import OOB from './views/OOB';

const RedirectRoute = props => <Route {...props} render={({ location }) => <Redirect to={{ pathname: '/character-select', state: { from: location } }} />} />;

// Print timings of promises to console (and performance logger)
// if we're running in development mode.
async function timed(name, promise) {
  if (process.env.NODE_ENV === 'development') console.time(name);
  const result = await promise;
  if (process.env.NODE_ENV === 'development') console.timeEnd(name);
  return result;
}

class App extends React.Component {
  constructor(props) {
    super();
    this.state = {
      status: {
        code: false,
        detail: false
      }
    };

    this.currentLanguage = props.i18n.getCurrentLanguage();

    // We do these as early as possible - we don't want to wait
    // for the component to mount before starting the web requests
    this.startupRequests = {
      storedManifest: timed(
        'storedManifest',
        dexie
          .table('manifest')
          .toCollection()
          .first()
      ),
      manifestIndex: timed('getManifestIndex', bungie.manifestIndex()),
      bungieSettings: timed('getSettings', bungie.settings()),
      voluspaStatistics: timed('getStatistics', voluspa.statistics())
    };

    const profile = ls.get('setting.profile');

    store.dispatch({
      type: 'MEMBER_SET_BY_PROFILE_ROUTE',
      payload: profile
    });
  }

  updateViewport = () => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    store.dispatch({ type: 'VIEWPORT_CHANGED', payload: { width, height } });
  };

  async componentDidMount() {
    this.updateViewport();
    window.addEventListener('resize', this.updateViewport);

    try {
      await timed('setUpManifest', this.setUpManifest());
    } catch (error) {
      //console.log(error);
      if (error.message === 'Failed to fetch') {
        this.setState({ status: { code: 'error_fetchingManifest', detail: error } });
      } else if (error.message === 'maintenance') {
        this.setState({ status: { code: 'error_maintenance', detail: error } });
      } else {
        this.setState({ status: { code: 'error_setUpManifest', detail: error } });
      }
    }
  }

  async setUpManifest() {
    this.setState({ status: { code: 'checkManifest' } });
    const storedManifest = await this.startupRequests.storedManifest;
    const manifestIndex = await this.startupRequests.manifestIndex;

    const currentVersion = manifestIndex.jsonWorldContentPaths[this.currentLanguage];
    let tmpManifest = null;

    if (!storedManifest || currentVersion !== storedManifest.version) {
      // Manifest missing from IndexedDB or doesn't match the current version -
      // download a new one and store it.
      tmpManifest = await this.downloadNewManifest(currentVersion);
    } else {
      tmpManifest = storedManifest.value;
    }

    tmpManifest.settings = await this.startupRequests.bungieSettings;

    if (tmpManifest.settings && tmpManifest.settings.systems && !tmpManifest.settings.systems.D2Profiles.enabled) {
      throw new Error('maintenance');
    }

    this.availableLanguages = Object.keys(manifestIndex.jsonWorldContentPaths);

    tmpManifest.statistics = (await this.startupRequests.voluspaStatistics) || {};

    manifest.set(tmpManifest);

    this.setState({ status: { code: 'ready' } });
  }

  async downloadNewManifest(version) {
    this.setState({ status: { code: 'fetchManifest' } });
    const manifest = await timed('downloadManifest', bungie.manifest(version));

    this.setState({ status: { code: 'setManifest' } });
    try {
      await timed('clearTable', dexie.table('manifest').clear());
      await timed('storeManifest', dexie.table('manifest').add({ version: version, value: manifest }));
    } catch (error) {
      // Can't write a manifest if we're in private mode in safari
      console.warn(`Error while trying to store the manifest in indexeddb: ${error}`);
    }
    return manifest;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewport);
  }

  RebindTooltips = () => {
    this.TooltipComponent.target_bindings();
  };

  render() {
    if (!window.ga) {
      GoogleAnalytics.init();
    }

    if (this.state.status.code !== 'ready') {
    // if (this.state.status.code !== 'ready' || this.state.status.code === 'ready') {
      return (
        <div className={cx('wrapper', this.props.theme.selected)}>
          <Loading state={this.state.status} />
          <NotificationLink />
        </div>
      );
    }

    return (
      <BrowserRouter>
        <Route
          render={route => (
            <div className={cx('wrapper', this.props.theme.selected)}>
              <NotificationBar updateAvailable={this.props.updateAvailable} />
              <NotificationLink />
              <NotificationProgress />

              {/* Don't run the refresh service if we're currently selecting
                a character, as the refresh will cause the member to
                continually reload itself */}
              <Route path='/character-select' children={({ match, ...rest }) => !match && <RefreshService {...this.props} />} />

              <Tooltip {...route} onRef={ref => (this.TooltipComponent = ref)} />
              <Route component={GoogleAnalytics.GoogleAnalytics} />
              <div className='main'>
                <Switch>
                  <Route path='/:membershipType([1|2|4])/:membershipId([0-9]+)/:characterId([0-9]+)' render={route => <ProfileRoutes {...route} RebindTooltips={this.RebindTooltips} />} />} />
                  <Route
                    render={() => (
                      <>
                        <Route render={route => <Header route={route} {...this.state} {...this.props} />} />
                        <Switch>
                          <RedirectRoute path='/clan' />
                          <RedirectRoute path='/legend' exact />
                          <RedirectRoute path='/sit-rep' exact />
                          <RedirectRoute path='/checklists' exact />
                          <RedirectRoute path='/collections/' />
                          <RedirectRoute path='/triumphs' />
                          <RedirectRoute path='/this-week' exact />
                          <RedirectRoute path='/dossier' />
                          <RedirectRoute path='/pgcrs' />

                          <Route path='/character-select' exact component={CharacterSelect} />
                          <Route path='/inspect/:hash?' exact component={Inspect} />
                          <Route path='/read/:kind?/:hash?' exact component={Read} />
                          <Route path='/settings' exact render={() => <Settings availableLanguages={this.availableLanguages} />} />
                          <Route path='/faq' exact component={FAQ} />
                          <Route path='/credits' exact component={Credits} />
                          <Route path='/leaderboards/:view?/:dom?/:sub?' render={route => <Leaderboards {...route} />} />
                          <Route path='/experiments' exact component={Experiments} />
                          <Route path='/experiments/clan-banner-builder/:decalBackgroundColorId?/:decalColorId?/:decalId?/:gonfalonColorId?/:gonfalonDetailColorId?/:gonfalonDetailId?/:gonfalonId?/' exact component={ClanBannerBuilder} />
                          <Route path='/experiments/data-inspector' exact component={DataInspector} />
                          <Route path='/experiments/zero-hour' exact component={ZeroHour} />
                          <Route path='/oob' component={OOB} />
                          <Route path='/' component={Index} />
                        </Switch>
                      </>
                    )}
                  />
                </Switch>
              </div>
              <Footer />
            </div>
          )}
        />
      </BrowserRouter>
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
)(App);
