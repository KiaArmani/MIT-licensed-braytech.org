import React from 'react';

import fs from 'fs';
import path from 'path';

import { Checklists } from './';
import TestRenderer from 'react-test-renderer';
import ChecklistFactory from './ChecklistFactory';

import manifest from '../../utils/manifest';

/// SETUP
function loadManifest() {
  const filename = path.join(__dirname, '__fixtures__/manifest.json');
  if (fs.existsSync(filename)) {
    return JSON.parse(fs.readFileSync(filename));
  } else {
    throw new Error(`
Could not load manifest file for tests. It is ignored by git as it is 62mb uncompressed.
..
Download it from Bungie by visiting https://www.bungie.net/Platform/Destiny2/Manifest/
..
and saving the file specified by Response.jsonWorldContentPaths.en to
..
${filename}
        `);
  }
}

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  withNamespaces: () => Component => {
    Component.defaultProps = { ...Component.defaultProps, t: a => a };
    return Component;
  }
}));

/// TESTS
const characterId = 'CHARACTER_ID';
manifest.set(loadManifest());
const data = require(`./__fixtures__/data.json`);
const dataShallow = require(`./__fixtures__/data.shallow.json`);
const t = a => a;

const lists = ['regionChests', 'lostSectors', 'adventures', 'corruptedEggs', 'amkaharaBones', 'catStatues', 'sleeperNodes', 'ghostScans', 'latentMemories', 'caydesJournals', 'ghostStories', 'awokenOfTheReef', 'forsakenPrince'];

lists.forEach(l => {
  test(`Checklist ${l} matches snapshot`, () => {
    const f = new ChecklistFactory(t, data.profile, characterId, false);

    const checklist = f[l]().checklist;
    const component = TestRenderer.create(<>{checklist}</>).toJSON();

    expect(component).toMatchSnapshot();
  });
});

test(`Checklists matches shallow snapshot`, () => {
  const props = {
    viewport: {
      width: 1280,
      height: 720
    },
    profile: { characterId, data: dataShallow },
    theme: {},
    collectibles: {},
    t
  };

  const component = TestRenderer.create(<Checklists {...props} />).toJSON();

  expect(component).toMatchSnapshot();
});
