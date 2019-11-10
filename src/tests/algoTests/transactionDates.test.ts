/* eslint-disable */
import { generateSequenceOfDates } from '../../evaluations';
import {
  monthly,
} from '../../stringConstants';
import { IDbAsset } from '../../types/interfaces';
import {
  log,
  // printDebug,
  showObj,
} from '../../utils';

export const testAsset: IDbAsset = {
  NAME: 'test_asset',
  CATEGORY: '',
  ASSET_START: 'Jan 2017',
  ASSET_VALUE: '1.2',
  ASSET_GROWTH: '0.0',
  ASSET_LIABILITY: '',
  ASSET_PURCHASE_PRICE: '0',
};

describe('generateTransactionDates', () => {
  it('make simple pair', () => {
    const roi = {
      start: new Date('May 1, 2018 00:00:00'),
      end: new Date('June 30, 2018 00:00:00'),
    };
    const moments = generateSequenceOfDates(roi, '1m');

    expect(moments.length).toBe(2);

    expect(moments[0].toDateString()).toBe('Tue May 01 2018');
    expect(moments[1].toDateString()).toBe('Fri Jun 01 2018');
  });

  it('short roi', () => {
    const roi = {
      start: new Date('May 1, 2018 00:00:00'),
      end: new Date('May 1, 2018 00:00:01'),
    };
    const moments = generateSequenceOfDates(roi, '1m');

    expect(moments.length).toBe(1);

    expect(moments[0].toDateString()).toBe('Tue May 01 2018');
  });

  it('zero-length roi', () => {
    const roi = {
      start: new Date('May 1, 2018 00:00:00'),
      end: new Date('May 1, 2018 00:00:00'),
    };
    const moments = generateSequenceOfDates(roi, '1m');

    expect(moments.length).toBe(0);
  });

  it('single long month roi', () => {
    const roi = {
      start: new Date('May 1, 2018 00:00:00'),
      end: new Date('June 1, 2018 00:00:00'),
    };
    const moments = generateSequenceOfDates(roi, '1m');

    expect(moments.length).toBe(1);
    expect(moments[0].toDateString()).toBe('Tue May 01 2018');
  });

  it('make two pairs and sort', () => {
    const roi = {
      start: new Date('May 1, 2018 00:00:00'),
      end: new Date('June 30, 2018 00:00:00'),
    };
    let moments = generateSequenceOfDates(roi, '1m');

    const roi2 = {
      start: new Date('May 2, 2018 00:00:00'),
      end: new Date('June 30, 2018 00:00:00'),
    };
    moments = moments.concat(generateSequenceOfDates(roi2, '1m'));
    // log(`moments = ${showObj(moments)}`);

    moments.sort((a, b) => (a > b ? 1 : a === b ? 0 : -1));
    expect(moments.length).toBe(4);

    expect(moments[0].toDateString()).toBe('Tue May 01 2018');
    expect(moments[1].toDateString()).toBe('Wed May 02 2018');
    expect(moments[2].toDateString()).toBe('Fri Jun 01 2018');
    expect(moments[3].toDateString()).toBe('Sat Jun 02 2018');
  });
});
