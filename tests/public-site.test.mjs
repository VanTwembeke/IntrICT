import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import nl from '../src/i18n/nl';
import en from '../src/i18n/en';
import Hero from '../src/components/home/Hero';
import Contact from '../src/components/home/Contact';
import Services from '../src/components/home/Services';
import Process from '../src/components/home/Process';
import Pricing from '../src/components/home/Pricing';
vi.mock('../src/components/home/PackageRequestModal', () => ({ default: ({ pkg, onClose }) => pkg ? React.createElement('div', { role: 'dialog', 'aria-label': 'Package request' }, `${pkg.name} / ${pkg.price} / ${pkg.billing_interval}`, React.createElement('button', { onClick: onClose }, 'Close request')) : null }));

// jsdom has no viewport observer; keep actual motion rendering and links.
vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
let lang = 'nl';
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ lang, t: lang === 'nl' ? nl : en }) }));
vi.mock('next/image', () => ({ default: ({ fill, priority, ...props }) => { void fill; void priority; return React.createElement('img', props); } }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); lang = 'nl'; });

const basic = { id: 'test-basic', name: 'Basic', price: 99, billing_interval: 'monthly', description: 'Test monthly package', features: ['8 uur'], color: 'blue', highlight: false };
const once = { ...basic, id: 'test-once', name: 'Test service', billing_interval: 'one_time' };

const RealPackageRequestModal = (await vi.importActual('../src/components/home/PackageRequestModal')).default;

test('primary homepage CTAs use a high-contrast background', () => {
  render(React.createElement(React.Fragment, null, React.createElement(Hero), React.createElement(Contact)));
  for (const link of document.querySelectorAll('a[href="/contact"]')) expect(link.className).toContain('bg-blue-700');
});

test('a closed package request does not lock scrolling or intercept Escape', () => {
  const onClose = vi.fn();
  render(React.createElement(RealPackageRequestModal, { pkg: null, onClose }));
  expect(document.body.style.overflow).not.toBe('hidden');
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();
});

test('pricing selects an available category when monthly packages are absent', () => {
  render(React.createElement(Pricing, { monthlyPackages: [], oneTimePackages: [once] }));
  expect(screen.getByRole('heading', { name: once.name })).toBeTruthy();
  expect(screen.getByRole('button', { name: nl.pricing.tabOneTime }).getAttribute('aria-pressed')).toBe('true');
});

for (const locale of ['nl', 'en']) {
  test(`${locale}: package requests preserve the selected price and recover from submission errors`, async () => {
    lang = locale;
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'server detail' }) }).mockResolvedValueOnce({ ok: true });
    render(React.createElement(RealPackageRequestModal, { pkg: basic, onClose: vi.fn() }));
    fireEvent.change(screen.getByLabelText(locale === 'nl' ? /Naam/ : /Name/), { target: { value: 'Test visitor' } });
    fireEvent.change(screen.getByLabelText(locale === 'nl' ? /E-mail/ : /Email/), { target: { value: 'visitor@example.test' } });
    const send = screen.getByRole('button', { name: locale === 'nl' ? 'Aanvraag versturen' : 'Send request' });
    fireEvent.click(send);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(locale === 'nl' ? 'Je aanvraag kon niet worden verstuurd' : 'Your request could not be sent');
    fireEvent.click(send);
    expect(await screen.findByRole('heading', { name: locale === 'nl' ? 'Aanvraag ontvangen!' : 'Request received!' })).toBeTruthy();
    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toBe('/api/public/package-requests');
    expect(JSON.parse(options.body)).toEqual({ package_name: 'Basic', package_price: 99, guest_name: 'Test visitor', guest_email: 'visitor@example.test', guest_phone: null, guest_company: null, notes: null });
    expect(screen.queryByText(/1 werkdag|1 business day/)).toBeNull();
    fetchMock.mockRestore();
  });
  test(`${locale}: package request is labelled, localized and keeps keyboard focus inside`, () => {
    lang = locale;
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    document.body.style.overflow = 'auto';
    const onClose = vi.fn();
    const { unmount } = render(React.createElement(RealPackageRequestModal, { pkg: basic, onClose }));
    const dialog = screen.getByRole('dialog', { name: 'Basic' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByLabelText(locale === 'nl' ? /Naam/ : /Name/)).toBeTruthy();
    expect(screen.getByText(locale === 'nl' ? nl.pricing.vatNote : en.pricing.vatNote)).toBeTruthy();
    expect(dialog.contains(document.activeElement)).toBe(true);
    const last = screen.getByRole('button', { name: locale === 'nl' ? 'Aanvraag versturen' : 'Send request' });
    last.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: locale === 'nl' ? 'Sluiten' : 'Close' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    expect(document.body.style.overflow).toBe('auto');
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
    document.body.style.overflow = '';
  });
  test(`${locale}: pricing announces selection, keeps VAT visible and requests the exact package`, () => {
    lang = locale;
    const t = locale === 'nl' ? nl : en;
    render(React.createElement(Pricing, { monthlyPackages: [basic], oneTimePackages: [once] }));
    const monthly = screen.getByRole('button', { name: t.pricing.tabMonthly });
    expect(monthly.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(t.pricing.vatNote).closest('[id="pricing-offers"]')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: `${t.pricing.cta} Basic` }));
    expect(screen.getByRole('dialog').textContent).toContain('Basic / 99 / monthly');
    fireEvent.click(screen.getByRole('button', { name: 'Close request' }));
    fireEvent.click(screen.getByRole('button', { name: t.pricing.tabOneTime }));
    expect(monthly.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: `${t.pricing.cta} Test service` }));
    expect(screen.getByRole('dialog').textContent).toContain('Test service / 99 / one_time');
  });
  test(`${locale}: hero explains who it helps and the visitor outcome`, () => {
    lang = locale;
    render(React.createElement(Hero));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(locale === 'nl' ? 'Een heldere website. Een herkenbaar merk.' : 'A clear website. A recognizable brand.');
    expect(screen.getByText(locale === 'nl' ? /zelfstandigen en KMO/ : /independent professionals and small businesses/).textContent).toMatch(locale === 'nl' ? /contact opnemen/ : /get in touch/);
  });
  test(`${locale}: hero sends visitors directly to contact and previews services`, () => {
    lang = locale;
    const t = locale === 'nl' ? nl : en;
    render(React.createElement(Hero));
    expect(screen.getByRole('link', { name: t.hero.startProject }).getAttribute('href')).toBe('/contact');
    expect(screen.getByRole('link', { name: locale === 'nl' ? 'Bekijk de diensten' : 'Explore services' }).getAttribute('href')).toBe('#services');
  });
  test(`${locale}: service cards offer a project conversation and localized reading`, () => {
    lang = locale;
    render(React.createElement(Services));
    expect(screen.getAllByRole('link', { name: locale === 'nl' ? 'Bespreek je project' : 'Discuss your project' }).map(a => a.getAttribute('href'))).toEqual(['/contact', '/contact', '/contact']);
    const slugs = locale === 'nl' ? ['website-ontwikkeling', 'logo-en-branding', 'digitale-strategie'] : ['website-development', 'logo-and-branding', 'digital-strategy'];
    for (const slug of slugs) expect(document.querySelector(`a[href="/blog/${slug}"]`)).not.toBeNull();
  });
  test(`${locale}: process is a numbered list with a direct next step`, () => {
    lang = locale;
    render(React.createElement(Process));
    expect(screen.getByRole('list').tagName).toBe('OL');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('link', { name: locale === 'nl' ? 'Plan een kennismaking' : 'Arrange an introduction' }).getAttribute('href')).toBe('/contact');
  });
  test(`${locale}: contact includes native expandable FAQs without price promises`, () => {
    lang = locale;
    render(React.createElement(Contact));
    const questions = document.querySelectorAll('details');
    expect(questions).toHaveLength(3);
    const summary = questions[0].querySelector('summary');
    expect(summary.textContent).toBe(locale === 'nl' ? 'Wat kost mijn project?' : 'What will my project cost?');
    expect(questions[0].open).toBe(false);
    fireEvent.click(summary);
    expect(questions[0].open).toBe(true);
    expect(questions[0].textContent).not.toMatch(/€|ROI|garantie|guarantee/);
  });
  test(`${locale}: home sections declare their language and contact offers an email fallback`, () => {
    lang = locale;
    render(React.createElement(React.Fragment, null, React.createElement(Hero), React.createElement(Services), React.createElement(Process), React.createElement(Contact)));
    for (const section of document.querySelectorAll('section')) {
      expect(section.lang).toBe(locale === 'en' ? 'en' : 'nl-BE');
      expect(section.className).toContain('[font-family:Arial,Helvetica,sans-serif]');
    }
    expect(screen.getByRole('link', { name: 'info@intrict.com' }).getAttribute('href')).toBe('mailto:info@intrict.com');
    for (const link of screen.getAllByRole('link')) expect(link.className).toContain('focus-visible:');
  });
  test(`${locale}: final contact CTA is a native navigable link`, () => {
    lang = locale;
    const t = locale === 'nl' ? nl : en;
    render(React.createElement(Contact));
    expect(screen.getByRole('link', { name: t.contactSection.cta1 }).getAttribute('href')).toBe('/contact');
    expect(screen.getByText(locale === 'nl' ? 'Geen account nodig' : 'No account needed')).toBeTruthy();
  });
}
