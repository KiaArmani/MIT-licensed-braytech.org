import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import { ProfileLink } from '../../components/ProfileLink';
import ObservedImage from '../../components/ObservedImage';
import { enumerateCollectibleState } from '../../utils/destinyEnums';

import './styles.css';

class Collectibles extends React.Component {
  constructor(props) {
    super(props);

    this.scrollToRecordRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.highlight && this.scrollToRecordRef.current !== null) {
      window.scrollTo({
        top: this.scrollToRecordRef.current.offsetTop + this.scrollToRecordRef.current.offsetHeight / 2 - window.innerHeight / 2
      });
    }
  }

  render() {
    const inspect = this.props.inspect ? true : false;
    const highlight = parseInt(this.props.highlight, 10) || false;

    let collectibles = [];

    if (this.props.node) {
      const tertiaryDefinition = manifest.DestinyPresentationNodeDefinition[this.props.node];

      if (tertiaryDefinition.children.presentationNodes.length > 0) {
        tertiaryDefinition.children.presentationNodes.forEach(node => {
          const nodeDefinition = manifest.DestinyPresentationNodeDefinition[node.presentationNodeHash];

          let row = [];
          let rowState = [];

          nodeDefinition.children.collectibles.forEach(child => {
            const collectibleDefinition = manifest.DestinyCollectibleDefinition[child.collectibleHash];

            let state = 0;
            if (this.props.member.data) {
              const characterId = this.props.member.characterId;
              const characterCollectibles = this.props.member.data.profile.characterCollectibles.data;
              const profileCollectibles = this.props.member.data.profile.profileCollectibles.data;
              let scope = profileCollectibles.collectibles[child.collectibleHash] ? profileCollectibles.collectibles[child.collectibleHash] : characterCollectibles[characterId].collectibles[child.collectibleHash];
              if (scope) {
                state = scope.state;
              }
            }

            rowState.push(state);

            row.push(
              <li
                key={collectibleDefinition.hash}
                className={cx('item', 'tooltip', {
                  completed: !enumerateCollectibleState(state).notAcquired && !enumerateCollectibleState(state).invisible
                })}
                data-itemhash={collectibleDefinition.itemHash}
              >
                <div className='icon'>
                  <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${collectibleDefinition.displayProperties.icon}`} />
                </div>
                {inspect && collectibleDefinition.itemHash ? <Link to={{ pathname: `/inspect/${collectibleDefinition.itemHash}`, state: { from: this.props.selfLinkFrom } }} /> : null}
              </li>
            );
          });

          collectibles.push(
            <li
              key={nodeDefinition.hash}
              className={cx('is-set', {
                completed: rowState.filter(collectible => !enumerateCollectibleState(collectible).notAcquired).length === rowState.length
              })}
            >
              <div className='set'>
                <ul className='list'>{row}</ul>
              </div>
              <div className='text'>
                <div className='name'>{nodeDefinition.displayProperties.name}</div>
              </div>
            </li>
          );
        });
      } else {
        tertiaryDefinition.children.collectibles.forEach(child => {
          const collectibleDefinition = manifest.DestinyCollectibleDefinition[child.collectibleHash];

          let state = 0;
          if (this.props.member.data) {
            const characterId = this.props.member.characterId;
            const characterCollectibles = this.props.member.data.profile.characterCollectibles.data;
            const profileCollectibles = this.props.member.data.profile.profileCollectibles.data;
            let scope = profileCollectibles.collectibles[child.collectibleHash] ? profileCollectibles.collectibles[child.collectibleHash] : characterCollectibles[characterId].collectibles[child.collectibleHash];
            if (scope) {
              state = scope.state;
            }

            if (this.props.collectibles.hideInvisibleCollectibles && enumerateCollectibleState(state).invisible) {
              return;
            }
          }

          // eslint-disable-next-line eqeqeq
          let ref = highlight == collectibleDefinition.hash ? this.scrollToRecordRef : null;

          if (collectibleDefinition.redacted || collectibleDefinition.itemHash === 0) {
            collectibles.push(
              <li
                key={collectibleDefinition.hash}
                ref={ref}
                className={cx('redacted', 'tooltip', {
                  // eslint-disable-next-line eqeqeq
                  highlight: highlight && highlight == collectibleDefinition.hash
                })}
                data-itemhash='343'
              >
                <div className='icon'>
                  <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${manifest.settings.destiny2CoreSettings.undiscoveredCollectibleImage}`} />
                </div>
                <div className='text'>
                  <div className='name'>Classified</div>
                  <div className='commonality'>{manifest.statistics.collections && manifest.statistics.collections[collectibleDefinition.hash] ? manifest.statistics.collections[collectibleDefinition.hash] : `0.00`}%</div>
                </div>
              </li>
            );
          } else {
            collectibles.push(
              <li
                key={collectibleDefinition.hash}
                ref={ref}
                className={cx('tooltip', {
                  completed: !enumerateCollectibleState(state).notAcquired,
                  // eslint-disable-next-line eqeqeq
                  highlight: highlight && highlight == collectibleDefinition.hash
                })}
                data-itemhash={collectibleDefinition.itemHash}
              >
                <div className='icon'>
                  <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${collectibleDefinition.displayProperties.icon}`} />
                </div>
                <div className='text'>
                  <div className='name'>{collectibleDefinition.displayProperties.name}</div>
                  <div className='commonality'>{manifest.statistics.collections && manifest.statistics.collections[collectibleDefinition.hash] ? manifest.statistics.collections[collectibleDefinition.hash] : `0.00`}%</div>
                </div>
                {inspect && collectibleDefinition.itemHash ? <Link to={{ pathname: `/inspect/${collectibleDefinition.itemHash}`, state: { from: this.props.selfLinkFrom } }} /> : null}
              </li>
            );
          }
        });
      }
    } else {
      let collectiblesRequested = this.props.hashes;

      collectiblesRequested.forEach(hash => {
        let collectibleDefinition = manifest.DestinyCollectibleDefinition[hash];

        let link = false;

        // selfLinkFrom

        try {
          let reverse1;
          let reverse2;
          let reverse3;

          manifest.DestinyCollectibleDefinition[hash].presentationInfo.parentPresentationNodeHashes.forEach(element => {
            let skip = false;
            manifest.DestinyPresentationNodeDefinition[498211331].children.presentationNodes.forEach(parentsChild => {
              if (manifest.DestinyPresentationNodeDefinition[parentsChild.presentationNodeHash].children.presentationNodes.filter(el => el.presentationNodeHash === element).length > 0) {
                skip = true;
                return; // if hash is a child of badges, skip it
              }
            });

            if (reverse1 || skip) {
              return;
            }
            reverse1 = manifest.DestinyPresentationNodeDefinition[element];
          });

          let iteratees = reverse1.presentationInfo ? reverse1.presentationInfo.parentPresentationNodeHashes : reverse1.parentNodeHashes;
          iteratees.forEach(element => {
            if (reverse2) {
              return;
            }
            reverse2 = manifest.DestinyPresentationNodeDefinition[element];
          });

          if (reverse2 && reverse2.parentNodeHashes) {
            reverse3 = manifest.DestinyPresentationNodeDefinition[reverse2.parentNodeHashes[0]];
          }

          link = `/collections/${reverse3.hash}/${reverse2.hash}/${reverse1.hash}/${hash}`;
        } catch (e) {
          console.log(e);
        }

        let state = 0;
        if (this.props.member.data) {
          
          const characterId = this.props.member.characterId;

          const characterCollectibles = this.props.member.data.profile.characterCollectibles.data;
          const profileCollectibles = this.props.member.data.profile.profileCollectibles.data;
        
          let scope = profileCollectibles.collectibles[hash] ? profileCollectibles.collectibles[hash] : characterCollectibles[characterId].collectibles[hash];
          if (scope) {
            state = scope.state;
          }

          if (this.props.collectibles.hideInvisibleCollectibles && enumerateCollectibleState(state).invisible) {
            return;
          }

        }

        collectibles.push(
          <li
            key={collectibleDefinition.hash}
            className={cx('tooltip', {
              linked: link && this.props.selfLinkFrom,
              completed: !enumerateCollectibleState(state).notAcquired
            })}
            data-itemhash={collectibleDefinition.itemHash}
          >
            <div className='icon'>
              <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${collectibleDefinition.displayProperties.icon}`} />
            </div>
            <div className='text'>
              <div className='name'>{collectibleDefinition.displayProperties.name}</div>
                  <div className='commonality'>{manifest.statistics.collections && manifest.statistics.collections[collectibleDefinition.hash] ? manifest.statistics.collections[collectibleDefinition.hash] : `0.00`}%</div>
            </div>
            {link && this.props.selfLinkFrom && !inspect ? <ProfileLink to={{ pathname: link, state: { from: this.props.selfLinkFrom } }} /> : null}
            {inspect && collectibleDefinition.itemHash ? <Link to={{ pathname: `/inspect/${collectibleDefinition.itemHash}`, state: { from: this.props.selfLinkFrom } }} /> : null}
          </li>
        );
      });
    }

    return collectibles;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    collectibles: state.collectibles
  };
}

export default connect(mapStateToProps)(Collectibles);
