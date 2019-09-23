import React from 'react';
import assign from 'lodash/assign';
import isEqual from 'lodash/isEqual';
import cx from 'classnames';
import Globals from '../../../utils/globals';
import rgbToHsl from '../../../utils/rgbToHsl';
import Spinner from '../../UI/Spinner';

import clanBannerManifestJson from '../../../data/clanBannerManifest';

import './styles.css';

class ClanBanner extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: 0
    };

    this.bannerConfig = {
      DecalBgImage: {
        src: false,
        color: false,
        el: false
      },
      DecalFgImage: {
        src: false,
        color: false,
        el: false
      },
      GonfalonImage: {
        src: false,
        color: false,
        el: false
      },
      GonfalonDetailImage: {
        src: false,
        color: false,
        el: false
      },
      StandImage: {
        src: '/img/bannercreator/FlagStand00.png',
        el: false
      },
      FlagOverlay: {
        src: '/img/bannercreator/flag_overlay.png',
        el: false
      }
    };

    this.clanBannerManifest = clanBannerManifestJson._embedded;
    this.clanBannerManifestFetch = this.clanBannerManifestFetch.bind(this);
    this.buildBannerConfig = this.buildBannerConfig.bind(this);
  }

  clanBannerManifestFetch = async () => {
    const request = await fetch('https://api.tyra-karn.com/DestinyManifest/mobileClanBannerDatabasePath', {
      headers: {
        accept: 'application/json'
      }
    });
    const response = await request.json();
    return response._embedded;
  };

  buildBannerConfig = clanBannerData => {
    this.setState({
      loaded: 0
    });

    let decals = this.clanBannerManifest.Decals.find(decal => decal.imageHash === clanBannerData.decalId);
    let decalPrimaryColor = this.clanBannerManifest.DecalPrimaryColors.find(color => color.colorHash === clanBannerData.decalColorId);
    let decalSecondaryColor = this.clanBannerManifest.DecalSecondaryColors.find(color => color.colorHash === clanBannerData.decalBackgroundColorId);
    this.bannerConfig.DecalFgImage.src = decals.foregroundImagePath;
    this.bannerConfig.DecalFgImage.color = `${decalPrimaryColor.red}, ${decalPrimaryColor.green}, ${decalPrimaryColor.blue}, ${Math.min(decalPrimaryColor.alpha, 1)}`;
    this.bannerConfig.DecalBgImage.src = decals.backgroundImagePath;
    this.bannerConfig.DecalBgImage.color = `${decalSecondaryColor.red}, ${decalSecondaryColor.green}, ${decalSecondaryColor.blue}, ${Math.min(decalSecondaryColor.alpha, 1)}`;

    let gonfalon = this.clanBannerManifest.Gonfalons.find(gonfalon => gonfalon.imageHash === clanBannerData.gonfalonId);
    let gonfalonColor = this.clanBannerManifest.GonfalonColors.find(color => color.colorHash === clanBannerData.gonfalonColorId);
    this.bannerConfig.GonfalonImage.src = gonfalon.foregroundImagePath;
    this.bannerConfig.GonfalonImage.color = `${gonfalonColor.red}, ${gonfalonColor.green}, ${gonfalonColor.blue}, ${Math.min(gonfalonColor.alpha, 1)}`;

    let gonfalonDetail = this.clanBannerManifest.GonfalonDetails.find(gonfalon => gonfalon.imageHash === clanBannerData.gonfalonDetailId);
    let gonfalonDetailColor = this.clanBannerManifest.GonfalonDetailColors.find(color => color.colorHash === clanBannerData.gonfalonDetailColorId);
    this.bannerConfig.GonfalonDetailImage.src = gonfalonDetail.foregroundImagePath;
    this.bannerConfig.GonfalonDetailImage.color = `${gonfalonDetailColor.red}, ${gonfalonDetailColor.green}, ${gonfalonDetailColor.blue}, ${Math.min(gonfalonDetailColor.alpha, 1)}`;

    // console.log(this.bannerConfig)

    Object.keys(this.bannerConfig).forEach(key => {
      let image = this.bannerConfig[key];
      let cache = new Image();
      image.el = cache;
      cache.onload = () => {
        let state = this.state.loaded + 1;
        this.setState({
          loaded: state
        });
      };
      cache.src = 'https://www.bungie.net' + image.src;
    });
  };

  componentWillMount() {
    //console.log('willMount', this.props.bannerData);
  }

  componentDidMount() {
    // this.clanBannerManifestFetch().then(clanBannerManifest => {
    //   // console.log(clanBannerManifest);
    //   this.clanBannerManifest = clanBannerManifest;

    //   this.buildBannerConfig(this.props.bannerData);
    // });
    this.buildBannerConfig(this.props.bannerData);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.bannerData !== this.props.bannerData) {
      // console.log('componentDidUpdate', this.props.bannerData);

      if (!this.clanBannerManifest) {
        this.clanBannerManifestFetch().then(clanBannerManifest => {
          // console.log(clanBannerManifest);
          this.clanBannerManifest = clanBannerManifest;

          this.buildBannerConfig(this.props.bannerData);
        });
      } else {
        this.buildBannerConfig(this.props.bannerData);
      }
    }
  }

  render() {
    // console.log('render', this.props.bannerData)

    let canvasWidth = 496;
    let canvasHeight = 1034;

    if (this.state.loaded === 6) {
      let canvasFinal = this.refs.canvas;
      let ctxFinal = canvasFinal.getContext('2d');

      let canvasGonfalon = document.createElement('canvas');
      canvasGonfalon.height = canvasHeight;
      canvasGonfalon.width = canvasWidth;
      let ctxGonfalon = canvasGonfalon.getContext('2d');

      let canvasGonfalonDetail = document.createElement('canvas');
      canvasGonfalonDetail.height = canvasHeight;
      canvasGonfalonDetail.width = canvasWidth;
      let ctxGonfalonDetail = canvasGonfalonDetail.getContext('2d');

      let canvasDecalBg = document.createElement('canvas');
      canvasDecalBg.height = canvasHeight;
      canvasDecalBg.width = canvasWidth;
      let ctxDecalBg = canvasDecalBg.getContext('2d');

      let canvasDecalFg = document.createElement('canvas');
      canvasDecalFg.height = canvasHeight;
      canvasDecalFg.width = canvasWidth;
      let ctxDecalFg = canvasDecalFg.getContext('2d');

      let canvasCombined = document.createElement('canvas');
      canvasCombined.height = canvasHeight;
      canvasCombined.width = canvasWidth;
      let ctxCombined = canvasCombined.getContext('2d');

      let canvasMasked = document.createElement('canvas');
      canvasMasked.height = canvasHeight;
      canvasMasked.width = canvasWidth;
      let ctxMasked = canvasMasked.getContext('2d');

      ctxFinal.clearRect(0, 0, canvasWidth, canvasHeight);

      ctxGonfalon.drawImage(this.bannerConfig.GonfalonImage.el, canvasWidth / 2 - this.bannerConfig.GonfalonImage.el.naturalWidth / 2, 47, this.bannerConfig.GonfalonImage.el.naturalWidth, this.bannerConfig.GonfalonImage.el.naturalHeight);
      ctxGonfalon.globalCompositeOperation = 'source-in';
      ctxGonfalon.fillStyle = 'rgba(' + this.bannerConfig.GonfalonImage.color + ')';
      ctxGonfalon.fillRect(0, 0, canvasWidth, canvasHeight);

      ctxGonfalonDetail.drawImage(this.bannerConfig.GonfalonDetailImage.el, canvasWidth / 2 - this.bannerConfig.GonfalonDetailImage.el.naturalWidth / 2, 47, this.bannerConfig.GonfalonDetailImage.el.naturalWidth, this.bannerConfig.GonfalonDetailImage.el.naturalHeight);
      ctxGonfalonDetail.globalCompositeOperation = 'source-in';
      ctxGonfalonDetail.fillStyle = 'rgba(' + this.bannerConfig.GonfalonDetailImage.color + ')';
      ctxGonfalonDetail.fillRect(0, 0, canvasWidth, canvasHeight);

      ctxDecalBg.drawImage(this.bannerConfig.DecalBgImage.el, canvasWidth / 2 - this.bannerConfig.DecalBgImage.el.naturalWidth / 2, 47, this.bannerConfig.DecalBgImage.el.naturalWidth, this.bannerConfig.DecalBgImage.el.naturalHeight);
      ctxDecalBg.globalCompositeOperation = 'source-in';
      ctxDecalBg.fillStyle = 'rgba(' + this.bannerConfig.DecalBgImage.color + ')';
      ctxDecalBg.fillRect(0, 0, canvasWidth, canvasHeight);

      ctxDecalFg.drawImage(this.bannerConfig.DecalFgImage.el, canvasWidth / 2 - this.bannerConfig.DecalFgImage.el.naturalWidth / 2, 47, this.bannerConfig.DecalFgImage.el.naturalWidth, this.bannerConfig.DecalFgImage.el.naturalHeight);
      ctxDecalFg.globalCompositeOperation = 'source-in';
      ctxDecalFg.fillStyle = 'rgba(' + this.bannerConfig.DecalFgImage.color + ')';
      ctxDecalFg.fillRect(0, 0, canvasWidth, canvasHeight);

      ctxCombined.drawImage(canvasGonfalon, 0, 0, canvasWidth, canvasHeight);
      ctxCombined.globalCompositeOperation = 'source-atop';
      ctxCombined.drawImage(canvasGonfalonDetail, 0, 0, canvasWidth, canvasHeight);
      ctxCombined.drawImage(canvasDecalBg, 0, 0, canvasWidth, canvasHeight);
      ctxCombined.drawImage(canvasDecalFg, 0, 0, canvasWidth, canvasHeight);

      ctxMasked.drawImage(canvasCombined, 0, 0, canvasWidth, canvasHeight);

      ctxMasked.globalCompositeOperation = 'source-atop';
      ctxMasked.drawImage(this.bannerConfig.FlagOverlay.el, canvasWidth / 2 - this.bannerConfig.FlagOverlay.el.naturalWidth / 2, 47, this.bannerConfig.FlagOverlay.el.naturalWidth, this.bannerConfig.FlagOverlay.el.naturalHeight);

      ctxFinal.drawImage(canvasMasked, 0, 0, canvasWidth, canvasHeight);
      ctxFinal.drawImage(this.bannerConfig.StandImage.el, canvasWidth / 2 - this.bannerConfig.GonfalonImage.el.naturalWidth / 2 - 10, 6, canvasWidth * 0.85, canvasHeight * 0.85);
    }

    return (
      <div className='canvas'>
        {this.state.loaded !== 6 ? <Spinner /> : null}
        <canvas ref='canvas' width={canvasWidth} height='900' />
      </div>
    );
  }
}

export default ClanBanner;
