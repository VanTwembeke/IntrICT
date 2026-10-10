import React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import ConditionalAnalytics from '../src/components/common/ConditionalAnalytics';
import CookieConsent from '../src/components/common/CookieConsent';

vi.mock('@vercel/analytics/next', () => ({ Analytics: () => React.createElement('div', { 'data-testid': 'analytics' }) }));
vi.mock('@vercel/speed-insights/next', () => ({ SpeedInsights: () => React.createElement('div', { 'data-testid': 'speed-insights' }) }));
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ t: { cookies: {
  heading: 'Cookies', settings: 'Settings', accept: 'Accept', essentialOnly: 'Reject', save: 'Save', cancel: 'Cancel',
} } }) }));
// Animation and third-party telemetry are outside the consent logic under test.
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => children,
  motion: { div: ({ children, initial, animate, exit, transition, ...props }) => {
    void initial; void animate; void exit; void transition;
    return React.createElement('div', props, children);
  } },
}));

beforeEach(() => {
  localStorage.clear();
  window.dataLayer = [];
  window.gtag = vi.fn();
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

for (const stored of [null, '{broken', JSON.stringify({ analytics: false })]) {
  test(`analytics stays off without valid opt-in: ${stored}`, () => {
    if (stored !== null) localStorage.setItem('cookie-consent', stored);
    render(React.createElement(ConditionalAnalytics));
    expect(screen.queryByTestId('analytics')).toBeNull();
    expect(screen.queryByTestId('speed-insights')).toBeNull();
  });
}

test('stored opt-in enables both telemetry components and synchronizes GTM', () => {
  localStorage.setItem('cookie-consent', JSON.stringify({ analytics: true, functional: false, marketing: true }));
  render(React.createElement(ConditionalAnalytics));
  expect(screen.getByTestId('analytics')).toBeTruthy();
  expect(screen.getByTestId('speed-insights')).toBeTruthy();
  expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
    analytics_storage: 'granted', ad_storage: 'granted', functionality_storage: 'denied', personalization_storage: 'granted',
  });
});

test('save events enable and revoke analytics using the event detail', () => {
  render(React.createElement(ConditionalAnalytics));
  act(() => window.dispatchEvent(new CustomEvent('cookie-consent-saved', { detail: { analytics: true } })));
  expect(screen.getByTestId('analytics')).toBeTruthy();
  act(() => window.dispatchEvent(new CustomEvent('cookie-consent-saved', { detail: { analytics: false } })));
  expect(screen.queryByTestId('analytics')).toBeNull();
  expect(window.gtag).toHaveBeenLastCalledWith('consent', 'update', {
    analytics_storage: 'denied', ad_storage: 'denied', functionality_storage: 'denied', personalization_storage: 'denied',
  });
});

test('saved opt-in hydrates from server markup without mismatch', async () => {
  localStorage.setItem('cookie-consent', JSON.stringify({ analytics: true }));
  const container = document.createElement('div');
  container.innerHTML = renderToString(React.createElement(ConditionalAnalytics));
  expect(container.innerHTML).toBe('');
  document.body.append(container);
  const onRecoverableError = vi.fn();
  let root;
  await act(async () => { root = hydrateRoot(container, React.createElement(ConditionalAnalytics), { onRecoverableError }); });
  expect(container.querySelector('[data-testid="analytics"]')).not.toBeNull();
  expect(onRecoverableError).not.toHaveBeenCalled();
  act(() => root.unmount());
  container.remove();
});

test('new visitors see the banner after exactly 1500ms; closing denies optional cookies', () => {
  vi.useFakeTimers();
  const onSave = vi.fn();
  window.addEventListener('cookie-consent-saved', onSave);
  render(React.createElement(CookieConsent));
  act(() => vi.advanceTimersByTime(1499));
  expect(screen.queryByText('Cookies')).toBeNull();
  act(() => vi.advanceTimersByTime(1));
  fireEvent.click(screen.getByLabelText('Sluit'));
  const saved = JSON.parse(localStorage.getItem('cookie-consent'));
  expect(saved).toEqual({ essential: true, analytics: false, functional: false, marketing: false, timestamp: expect.any(String) });
  expect(onSave.mock.calls[0][0].detail).toEqual({ essential: true, analytics: false, functional: false, marketing: false });
  window.removeEventListener('cookie-consent-saved', onSave);
});

for (const stored of [JSON.stringify({ analytics: true }), '{broken']) {
  test(`stored preferences suppress banner, reset restores denied defaults: ${stored}`, () => {
    vi.useFakeTimers();
    localStorage.setItem('cookie-consent', stored);
    render(React.createElement(CookieConsent));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByText('Cookies')).toBeNull();
    act(() => window.dispatchEvent(new CustomEvent('cookie-consent-reset')));
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getAllByRole('switch').map(toggle => toggle.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false', 'false']);
    expect(screen.getAllByRole('switch')[0].disabled).toBe(true);
    fireEvent.click(screen.getAllByRole('switch')[1]);
    fireEvent.click(screen.getByText('Save'));
    expect(JSON.parse(localStorage.getItem('cookie-consent')).analytics).toBe(true);
  });
}

test('accept all saves explicit opt-in for every category', () => {
  render(React.createElement(CookieConsent));
  act(() => window.dispatchEvent(new CustomEvent('cookie-consent-reset')));
  fireEvent.click(screen.getByText('Accept'));
  expect(JSON.parse(localStorage.getItem('cookie-consent'))).toEqual({
    essential: true, analytics: true, functional: true, marketing: true, timestamp: expect.any(String),
  });
});

test('unmount removes consent listeners and the delayed banner timer', () => {
  vi.useFakeTimers();
  const gtag = window.gtag;
  const view = render(React.createElement(React.Fragment, null, React.createElement(ConditionalAnalytics), React.createElement(CookieConsent)));
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
  act(() => window.dispatchEvent(new CustomEvent('cookie-consent-saved', { detail: { analytics: true } })));
  expect(gtag).not.toHaveBeenCalled();
});
