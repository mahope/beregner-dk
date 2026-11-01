// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackEvent, umamiTrack } from './analytics';

describe('analytics helper', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    window.plausible = undefined;
    window.umami = undefined;
  });

  it('calls both Plausible and Umami', () => {
    window.plausible = vi.fn();
    window.umami = { track: vi.fn() };
    trackEvent('test', { calculator: 'bmi' });
    expect(window.plausible).toHaveBeenCalledWith('test', { props: { calculator: 'bmi' } });
    expect(window.umami.track).toHaveBeenCalledWith('test', { calculator: 'bmi' });
  });

  it('retries Umami until its script has loaded', () => {
    const track = vi.fn();
    umamiTrack('late', { a: 1 });
    expect(track).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2000);
    window.umami = { track };
    vi.advanceTimersByTime(500);
    expect(track).toHaveBeenCalledWith('late', { a: 1 });
    expect(track).toHaveBeenCalledTimes(1);
  });

  it('gives up after 15 s', () => {
    umamiTrack('never');
    vi.advanceTimersByTime(16000);
    expect(vi.getTimerCount()).toBe(0);
    const track = vi.fn();
    window.umami = { track };
    vi.advanceTimersByTime(5000);
    expect(track).not.toHaveBeenCalled();
  });

  it('isolates failures between the two trackers', () => {
    window.plausible = vi.fn(() => {
      throw new Error('plausible down');
    });
    const track = vi.fn();
    window.umami = { track };
    expect(() => trackEvent('x')).not.toThrow();
    expect(track).toHaveBeenCalledTimes(1);

    window.plausible = vi.fn();
    window.umami = {
      track: vi.fn(() => {
        throw new Error('umami down');
      }),
    };
    expect(() => trackEvent('y')).not.toThrow();
    expect(window.plausible).toHaveBeenCalledTimes(1);
  });
});
