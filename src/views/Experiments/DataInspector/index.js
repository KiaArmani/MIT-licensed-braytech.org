import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import JSONTree from 'react-json-tree';

import manifest from '../../../utils/manifest';

import './styles.css';

class DataInspector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.data = {};
    
    Object.keys(manifest)
      .sort()
      .forEach(key => {
        let skip = ['set', 'settings', 'statistics'];

        if (skip.includes(key)) {
          return;
        }

        this.data[key] = manifest[key];
      });
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className='view' id='data-inspector'>
        <JSONTree
          data={this.data}
          theme={{
            base00: "#263238",
            base01: "#2C393F",
            base02: "#37474F",
            base03: "#707880",
            base04: "#C9CCD3",
            base05: "#CDD3DE",
            base06: "#D5DBE5",
            base07: "#FFFFFF",
            base08: "#EC5F67",
            base09: "#EA9560",
            base0A: "#FFCC00",
            base0B: "#8BD649",
            base0C: "#80CBC4",
            base0D: "#89DDFF",
            base0E: "#82AAFF",
            base0F: "#EC5F67" 
          }}
          valueRenderer={raw => {
            if (typeof raw === 'string') {
              let match = raw.match(/(\/.*\.\w+)/g);
              if (raw.length > 0 && match) {
                return <img src={`https://www.bungie.net${match[0]}`} alt='' />
              } else {
                return raw;
              }
            } else {
              return raw;
            }
          }}
        />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(DataInspector);
