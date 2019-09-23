import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import Records from '../../components/Records';
import Collectibles from '../../components/Collectibles';
import Items from '../../components/Items';
import ObservedImage from '../../components/ObservedImage';
import manifest from '../../utils/manifest';

import './styles.css';

class ThisWeek extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, member } = this.props;
    const { characterId } = member;
    const { profile, milestones } = member.data;

    const resetTime = '17:00:00Z';

    const cycleInfo = {
      epoch: {
        // start of cycle in UTC
        ascendant: new Date(`2018-09-04T${resetTime}`).getTime(),
        curse: new Date(`2018-09-11T${resetTime}`).getTime(),
        ep: new Date(`2018-05-08T${resetTime}`).getTime(),
        reckoning: new Date(`2018-03-12T${resetTime}`).getTime(),
        whisper: new Date(`2018-05-28T${resetTime}`).getTime(),
        zerohour: new Date(`2018-05-28T${resetTime}`).getTime()
      },
      cycle: {
        // how many week cycle
        ascendant: 6,
        curse: 3,
        ep: 5,
        reckoning: 2,
        whisper: 3,
        zerohour: 3
      },
      elapsed: {}, // elapsed time since cycle started
      week: {} // current week in cycle
    };

    const time = new Date().getTime();
    const msPerWk = 604800000;

    for (var cycle in cycleInfo.cycle) {
      cycleInfo.elapsed[cycle] = time - cycleInfo.epoch[cycle];
      cycleInfo.week[cycle] = Math.floor((cycleInfo.elapsed[cycle] / msPerWk) % cycleInfo.cycle[cycle]) + 1;
    }

    const consolidatedInfo = {
      curse: {
        1: {
          triumphs: [
            // DestinyRecordDefinition.Hashes
            2144075646, // The Scorn Champion (Heroic Blind Well)
            3675740696, // Hidden Riches (Ascendant Chests)
            2769541312, // Broken Courier (Weekly Mission)
            1768837759 // Bridge Troll (Hidden Boss in Weekly Mission)
          ],
          items: [], // DestinyItemDefinition.Hashes
          collectibles: [] // DestinyCollectableDefinition.Hashes
        },
        2: {
          triumphs: [
            2144075647, // The Hive Champion (Heroic Blind Well)
            3675740699, // Bolder Fortunes (Ascendant Chests)
            2419556790, // The Oracle Engine (Weekly Mission)
            2968758821, // Aggro No (Hidden Boss in Weekly Mission)
            202137963 // Twinsies (Kill ogres in Weekly Mission within 5 secs of each other)
          ],
          items: [],
          collectibles: []
        },
        3: {
          triumphs: [
            2144075645, // The Taken Champion (Heroic Blind Well)
            3675740698, // War Chests (Ascendant Chests)
            749838902, // Into the Unknown (Visit Mara)
            1842255613, // Fideicide II (Bones in Mara's Throne World)
            2314271318, // Never Again (Complete Shattered Throne)
            1290451257, // Seriously, Never Again (Complete Shattered Throne, Solo, 0 deaths)
            3309476373, // A Thorny Predicament (1 Phase Vorgeth in the Shattered Throne)
            851701008, // Solo-nely (Complete Shattered Throne, Solo)
            1621950319, // Come at Me (Complete Shattered Throne, wearing full set of unpurified Reverie Dawn)
            2029263931, // Curse This (Complete Shattered Throne, 0 deaths)
            3024450468, // Katabasis (Eggs in Shattered Throne)
            1842255612, // Fideicide I (Bones in Shattered Throne)
            1859033175, // Cosmogyre II (Bones in Shattered Throne)
            1859033168, // Archiloquy (Bones in Shattered Throne)
            1859033171, // Brephos I (Bones in Shattered Throne)
            2358176597, // Dark Monastery (Weekly Mission)
            1842255615, // Ecstasiate III (Bones in Weekly Mission)
            1236992882 // Odynom-Nom-Nom (Hidden Boss in Weekly Mission)
          ],
          items: [],
          collectibles: []
        }
      },
      ascendant: {
        1: {
          challenge: t('Ouroborea'),
          region: t("Aphelion's Rest"),
          triumphs: [
            3024450470, // Nigh II (Eggs)
            1842255608, // Imponent I (Bones)
            2856474352 // Eating Your Own Tail (Time Trial)
          ],
          items: [],
          collectibles: []
        },
        2: {
          challenge: t('Forfeit Shrine'),
          region: t('Gardens of Esila'),
          triumphs: [
            2974117611, // Imponent II (Eggs)
            1842255611, // Heresiology (Bones)
            3422458392 // Never Forfeit (Time Trial)
          ],
          items: [],
          collectibles: []
        },
        3: {
          challenge: t('Shattered Ruins'),
          region: t('Spine of Keres'),
          triumphs: [
            3024450469, // Imponent V (Eggs)
            1859033176, // Ecstasiate I (Bones)
            2858561750 // Shatter That Record (Time Trial)
          ],
          items: [],
          collectibles: []
        },
        4: {
          challenge: t('Keep of Honed Edges'),
          region: t("Harbinger's Seclude"),
          triumphs: [
            2974117605, // Imponent IV (Eggs)
            1842255614, // Ecstasiate II (Bones)
            3578247132 // Honed for Speed (Time Trial)
          ],
          items: [],
          collectibles: []
        },
        5: {
          challenge: t('Agonarch Abyss'),
          region: t('Bay of Drowned Wishes'),
          triumphs: [
            3024450465, // Palingenesis I (Eggs)
            1859033177, // Cosmogyre IV (Bones)
            990661957 // Argonach Agony (Time Trial)
          ],
          items: [],
          collectibles: []
        },
        6: {
          challenge: t('Cimmerian Garrison'),
          region: t('Chamber of Starlight'),
          triumphs: [
            3024450471, // Nigh I (Eggs)
            1859033173, // Brephos III (Bones)
            147323772 // Run the Gauntlet (Time Trial)
          ],
          items: [],
          collectibles: []
        }
      },
      ep: {
        1: {
          boss: t('Nur Abath, Crest of Xol'),
          items: [
            // https://github.com/Bungie-net/api/issues/732
            3243866699 // Worldline Ideasthesia: Torsion
          ],
          collectibles: [
            1041306082 // IKELOS_SG
          ]
        },
        2: {
          boss: t('Kathok, Roar of Xol'),
          triumphs: [],
          items: [
            3243866698 // Worldline Ideasthesia: Anarkhiia
          ],
          collectibles: [
            2998976141 // IKELOS_SMG
          ]
        },
        3: {
          boss: t('Damkath, The Mask'),
          triumphs: [],
          items: [
            // https://youtu.be/lrPf16ZHevU?t=104
            3243866697 //Worldline Ideasthesia: Cavalry
          ],
          collectibles: [
            1203091693 // IKELOS_SR
          ]
        },
        4: {
          boss: t('Naksud, the Famine'),
          triumphs: [],
          items: [
            3243866696 //  Worldline Ideasthesia: Faktura
          ],
          collectibles: [
            1041306082, // IKELOS_SG
            2998976141, // IKELOS_SMG
            1203091693 // IKELOS_SR
          ]
        },
        5: {
          boss: t('Bok Litur, Hunger of Xol'),
          triumphs: [],
          items: [
            3243866703 // Worldline Ideasthesia: Black Square
          ],
          collectibles: [
            1041306082, // IKELOS_SG
            2998976141, // IKELOS_SMG
            1203091693 // IKELOS_SR
          ]
        }
      },
      reckoning: {
        1: {
          boss: t('Likeness of Oryx'),
          triumphs: [],
          collectibles: [
            
          ]
        },
        2: {
          boss: t('The Swords'),
          triumphs: [],
          collectibles: [
            
          ]
        }
      },
      whisper: {
        2: {
          modifiers: [3362074814]
        },
        1: {
          modifiers: [3215384520]
        },
        3: {
          modifiers: [2558957669]
        }
      },
      zerohour: {
        2: {
          modifiers: [3362074814]
        },
        1: {
          modifiers: [3215384520]
        },
        3: {
          modifiers: [2558957669]
        }
      },
      nightfall: {
        3145298904: {
          // The Arms Dealer
          triumphs: [
            3340846443, // The Arms Dealer
            4267516859 // Trash the Thresher
          ],
          items: [],
          collectibles: [
            3036030066, // Tilt Fuse
            3490589921 // The Arms Dealer (Emblem)
          ]
        },
        3108813009: {
          // Warden of Nothing
          triumphs: [
            2836924866, // Warden of Nothing
            1469598452 // Solar Dance
          ],
          items: [],
          collectibles: [
            1279318101, // Warden's Law
            2263264048 // Warden of Nothing (Emblem)
          ]
        },
        3034843176: {
          // The Corrupted
          triumphs: [
            3951275509, // The Corrupted
            3641166665 // Relic Rumble
          ],
          items: [],
          collectibles: [
            1099984904, // Horror's Least
            1410290331 // The Corrupted (Emblem)
          ]
        },
        3280234344: {
          // Savathûn's Song
          triumphs: [
            2099501667, // Savathûn's Song
            1442950315 // The Best Defense
          ],
          items: [],
          collectibles: [
            1333654061, // Duty Bounds
            3490589926 // Savathûn's Song (Emblem)
          ]
        },
        3289589202: {
          // The Pyramidion
          triumphs: [
            1060780635, // The Pyramidion
            1142177491 // Siege Engine
          ],
          items: [],
          collectibles: [
            1152758802, // Silicon Neuroma
            3490589930 // The Pyramidion (Emblem)
          ]
        },
        3718330161: {
          // Tree of Probabilities
          triumphs: [
            2282894388, // Tree of Probabilities
            3636866482 // Laser Dodger
          ],
          items: [],
          collectibles: [
            1279318110, // D.F.A.
            3490589924 // Tree of Probabilities (Emblem)
          ]
        },
        3372160277: {
          // Lake of Shadows
          triumphs: [
            1329556468, // Lake of Shadows
            413743786 // Tether Time
          ],
          items: [],
          collectibles: [
            1602518767, // The Militia's Birthright
            3896331530 // Lake of Shadows (Emblem)
          ]
        },
        //1391780798: { // Broodhold - PS4 exclusive
        //  triumphs: [],
        //  items: [],
        //  collectibles: []
        //},
        3701132453: {
          // The Hollowed Lair
          triumphs: [
            3450793480, // The Hollowed Lair
            3847579126 // Arc Avoidance
          ],
          items: [],
          collectibles: [
            1074861258, // Mindbender's Ambition
            3314387486 // The Hollowed Lair (Emblem)
          ]
        },
        272852450: {
          // Will of the Thousands
          triumphs: [
            1039797865, // Will of the Thousands
            3013611925 // Three and Out
          ],
          items: [],
          collectibles: [
            2466440635, // Worm God Incarnation
            1766893928 // Will of the Thousands (Emblem)
          ]
        },
        4259769141: {
          // The Inverted Spire
          triumphs: [
            3973165904, // The Inverted Spire
            1498229894 //The Floor Is Lava
          ],
          items: [],
          collectibles: [
            1718922261, // Trichromatica
            3490589925 //The Inverted SPire (Emblem)
          ]
        },
        522318687: {
          // Strange Terrain
          triumphs: [
            165166474, // Strange Terrain
            1871570556 // Don't Take Five
          ],
          items: [],
          collectibles: [
            1534387877, // BrayTech Osprey
            1766893929 // Strange Terrain (Emblem)
          ]
        },
        1282886582: {
          // Exodus Crash
          triumphs: [
            1526865549, // Exodus Crash
            2140068897 // Faster than Lightning
          ],
          items: [],
          collectibles: [
            3036030067, // Impact Velocity
            3490589927 // Exodus Crash (Emblem)
          ]
        },
        936308438: {
          // A Garden World
          triumphs: [
            2692332187, // A Garden World
            1398454187 // The Quickening
          ],
          items: [],
          collectibles: [
            2448009818, //Universal Wavefunction
            3490589931 // A Garden World (Emblem)
          ]
        },
        1034003646: {
          // The Insight Terminus
          triumphs: [
            3399168111, // The Insight Terminus
            599303591 // Capture Completionist
          ],
          items: [],
          collectibles: [
            1186314105, // The Long Goodbye
            465974149 // Insight Terminus (Emblem)
          ]
        }
      },
      flashpoint: {
        538154339: {
          // FLASHPOINT: TITAN
          triumphs: [
            2542531058, // Flashpoint
            1632551190 // Heroically Adventurous
          ]
        },
        794779273: {
          //FLASHPOINT: IO
          triumphs: [
            2163667980, // Flashpoint
            3686586344 // Heroically Adventurous
          ]
        },
        905940422: {
          //FLASHPOINT: MERCURY
          triumphs: [
            2548580601, // Flashpoint
            3632308741 // Heroically Adventurous
          ]
        },
        2332272114: {
          //FLASHPOINT: EDZ
          triumphs: [
            855929237, // Flashpoint
            1683000545 // Heroically Adventurous
          ]
        },
        3232202236: {
          //FLASHPOINT: TANGLED SHORE
          triumphs: [
            2070013491 // Flashpoint
            // Has no 'Heroically Adventurous'
          ]
        },
        3588655854: {
          //FLASHPOINT: NESSUS
          triumphs: [
            1652021369, // Flashpoint
            633055621 // Heroically Adventurous
          ]
        },
        3929972810: {
          //FLASHPOINT: MARS
          triumphs: [
            1414820429, // Flashpoint
            1417930213 // Heroically Adventurous
          ]
        }
      }
    };

    // console.log(cycleInfo.week);
    // console.log(consolidatedInfo.curse[cycleInfo.week.curse], consolidatedInfo.ascendant[cycleInfo.week.ascendant], consolidatedInfo.ep[cycleInfo.week.ep]);

    // flashpoint
    const flashpoint = manifest.DestinyMilestoneDefinition[463010297].quests[milestones[463010297].availableQuests[0].questItemHash];
    let nightfalls = [];
    // scored nightfall strikes
    milestones[2171429505].activities
      .filter(activity => activity.modifierHashes)
      .forEach(activity => {
        let nightfall = manifest.DestinyActivityDefinition[activity.activityHash];

        nightfalls.push(
          <div key={nightfall.hash} className='content'>
            <div className='module-header'>
              <div className='sub-title'>{t('Nightfall')}</div>
              <div className='name'>{nightfall.selectionScreenDisplayProperties.name}</div>
            </div>
            <h4>Collectibles</h4>
            <ul className='list collection-items'>
              <Collectibles selfLinkFrom='/this-week' {...this.props} hashes={consolidatedInfo.nightfall[nightfall.hash].collectibles} />
            </ul>
            <h4>Triumphs</h4>
            <ul className='list record-items'>
              <Records selfLinkFrom='/this-week' {...this.props} hashes={consolidatedInfo.nightfall[nightfall.hash].triumphs} ordered forceDisplay />
            </ul>
          </div>
        );
      });

    // console.log(Object.values(milestones).map(m => {
    //   m.def = manifest.DestinyMilestoneDefinition[m.milestoneHash];
    //   return m;
    // }));

    const levAcitivty = milestones[3660836525] ? milestones[3660836525].activities[0] : false;
    const eowAcitivty = milestones[2986584050] ? milestones[2986584050].activities.find(a => a.activityHash === 809170886) : false;

    const reckoningModifiers = milestones[601087286].activities[0].modifierHashes;
    const strikesModifiers = milestones[1437935813].activities[0].modifierHashes;

    return (
      <div className={cx('view', this.props.theme.selected)} id='this-week'>
        <div className='module'>
          <div className='content'>
            <div className='page-header'>
              <div className='sub-title'>{manifest.DestinyMilestoneDefinition[463010297].displayProperties.name}</div>
              <div className='name'>{manifest.DestinyDestinationDefinition[flashpoint.destinationHash].displayProperties.name}</div>
            </div>
            <h4>Triumphs</h4>
            <ul className='list record-items'>
              <Records selfLinkFrom='/this-week' {...this.props} hashes={consolidatedInfo.flashpoint[flashpoint.questItemHash].triumphs} ordered forceDisplay />
            </ul>
          </div>
          <div className='content'>
            <h4>Active Modifiers</h4>
            <ul className='list modifiers'>
              {strikesModifiers.map((m, i) => {
                let modDef = manifest.DestinyActivityModifierDefinition[m];
                return (
                  <li key={i}>
                    <div className='icon'>
                      <ObservedImage className='image' src={`https://www.bungie.net${modDef.displayProperties.icon}`} />
                    </div>
                    <div className='text'>
                      <div className='name'>{modDef.displayProperties.name}</div>
                      <div className='description'>{modDef.displayProperties.description}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className='content'>
            <div className='module-header'>
              <div className='sub-title'>{t('The Reckoning')}</div>
              <div className='name'>{consolidatedInfo.reckoning[cycleInfo.week.reckoning].boss}</div>
            </div>
            <h4>Active Modifiers</h4>
            <ul className='list modifiers'>
              {reckoningModifiers.map((m, i) => {
                let modDef = manifest.DestinyActivityModifierDefinition[m];
                return (
                  <li key={i}>
                    <div className='icon'>
                      <ObservedImage className='image' src={`https://www.bungie.net${modDef.displayProperties.icon}`} />
                    </div>
                    <div className='text'>
                      <div className='name'>{modDef.displayProperties.name}</div>
                      <div className='description'>{modDef.displayProperties.description}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className='content'>
            <div className='module-header'>
              <div className='sub-title'>{t('Heroic Mission')}</div>
              <div className='name'>{t('Zero Hour')}</div>
            </div>
            <h4>Active Modifier</h4>
            <ul className='list modifiers'>
              {consolidatedInfo.zerohour[cycleInfo.week.zerohour].modifiers.map((m, i) => {
                let modDef = manifest.DestinyActivityModifierDefinition[m];
                return (
                  <li key={i}>
                    <div className='icon'>
                      <ObservedImage className='image' src={`https://www.bungie.net${modDef.displayProperties.icon}`} />
                    </div>
                    <div className='text'>
                      <div className='name'>{modDef.displayProperties.name}</div>
                      <div className='description'>{modDef.displayProperties.description}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className='content'>
            <div className='module-header'>
              <div className='sub-title'>{t('Heroic Mission')}</div>
              <div className='name'>{t('Whisper of the Worm')}</div>
            </div>
            <h4>Active Modifier</h4>
            <ul className='list modifiers'>
              {consolidatedInfo.whisper[cycleInfo.week.whisper].modifiers.map((m, i) => {
                let modDef = manifest.DestinyActivityModifierDefinition[m];
                return (
                  <li key={i}>
                    <div className='icon'>
                      <ObservedImage className='image' src={`https://www.bungie.net${modDef.displayProperties.icon}`} />
                    </div>
                    <div className='text'>
                      <div className='name'>{modDef.displayProperties.name}</div>
                      <div className='description'>{modDef.displayProperties.description}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        <div className='module'>
          <div className='content'>
            <div className='module-header'>
              <div className='sub-title'>{t('Ascendant Challenge')}</div>
              <div className='name'>{consolidatedInfo.ascendant[cycleInfo.week.ascendant].challenge}, {consolidatedInfo.ascendant[cycleInfo.week.ascendant].region}</div>
            </div>
            <h4>Triumphs</h4>
            <ul className='list record-items'>
              <Records selfLinkFrom='/this-week' {...this.props} hashes={consolidatedInfo.ascendant[cycleInfo.week.ascendant].triumphs} ordered forceDisplay />
            </ul>
          </div>
          <div className='content'>
            <div className='module-header'>
              <div className='sub-title'>Savathûn's Curse</div>
              <div className='name'>{cycleInfo.week.curse}/3</div>
            </div>
            <h4>Triumphs</h4>
            <ul className='list record-items'>
              <Records selfLinkFrom='/this-week' {...this.props} hashes={consolidatedInfo.curse[cycleInfo.week.curse].triumphs} ordered forceDisplay />
            </ul>
          </div>
        </div>
        <div className='module'>
          <div className='content'>
            <div className='module-header'>
              <div className='sub-title'>{t('Raid')}</div>
              <div className='name'>{t('Leviathan')}</div>
            </div>
            <h4>Active Rotation</h4>
            <ul className='list modifiers'>
              {levAcitivty ? levAcitivty.phaseHashes.map((p, i) => {
                let phases = {
                  3847906370: {
                    name: t('The Pleasure Gardens'),
                    description: t('Smell the roses, Guardian... Feed my hungry pets'),
                    icon: manifest.DestinyActivityModifierDefinition[871205855].displayProperties.icon
                  },
                  2188993306: {
                    name: t('The Royal Pools'),
                    description: t("Bathe with my loyalists in their pools"),
                    icon: manifest.DestinyActivityModifierDefinition[3296085675].displayProperties.icon
                  },
                  1431486395: {
                    name: t('The Gauntlet'),
                    description: t('Demonstrate your tenacity for the game, my champion'),
                    icon: manifest.DestinyActivityModifierDefinition[2863316929].displayProperties.icon
                  },
                  4231923662: {
                    name: t('The Throne'),
                    description: t('COME– I must congratulate you in person! [maniacal laughter]'),
                    icon: manifest.DestinyActivityModifierDefinition[2770077977].displayProperties.icon
                  }
                }

                return (
                  <li key={i}>
                    <div className='icon'>
                      <ObservedImage className='image' src={`https://www.bungie.net${phases[p].icon}`} />
                    </div>
                    <div className='text'>
                      <div className='name'>{phases[p].name}</div>
                      <div className='description'>{phases[p].description}</div>
                    </div>
                  </li>
                )
              }) : null}
            </ul>
          </div>
          {/* <div className='content'>
            <div className='module-header'>
              <div className='sub-title'>{t('Raid')}</div>
              <div className='name'>{t('Leviathan Lairs')}</div>
            </div>
            <h4>Active Modifiers</h4>
            <ul className='list modifiers'>
              {eowAcitivty ? eowAcitivty.modifierHashes.map((m, i) => {
                let modDef = manifest.DestinyActivityModifierDefinition[m];
                return (
                  <li key={i}>
                    <div className='icon'>
                      <ObservedImage className='image' src={`https://www.bungie.net${modDef.displayProperties.icon}`} />
                    </div>
                    <div className='text'>
                      <div className='name'>{modDef.displayProperties.name}</div>
                      <div className='description'>{modDef.displayProperties.description}</div>
                    </div>
                  </li>
                )
              }) : null}
            </ul>
          </div> */}
          <div className='content'>
            <div className='module-header'>
              <div className='sub-title'>{t('Escalation Protocol')}</div>
              <div className='name'>{consolidatedInfo.ep[cycleInfo.week.ep].boss}</div>
            </div>
            <h4>Collectibles</h4>
            <ul className='list collection-items'>
              <Collectibles selfLinkFrom='/this-week' {...this.props} hashes={consolidatedInfo.ep[cycleInfo.week.ep].collectibles} />
            </ul>
            {/* <h4>Catalyst Items: Worldline Zero</h4>
            <ul className='list inventory-items'>
              <Items hashes={consolidatedInfo.ep[cycleInfo.week.ep].items} disableTooltip />
            </ul> */}
          </div>
        </div>
        <div className='module'>
          {nightfalls}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    collectibles: state.collectibles,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(ThisWeek);
