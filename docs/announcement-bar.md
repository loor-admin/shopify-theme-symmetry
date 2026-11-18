# Announcement bar

The header group renders `announcement-bar` immediately before `header-beatnik`.
The previous embedded header announcement has been replaced by this section.
Assets load once in `layout/theme.liquid`, including when sections reload in the
Shopify editor. Supporting snippets provide utility slots and social icons.

## Merchant setup

Use **Header > Announcement bar** to add up to 12 announcement blocks, change
colors, padding, font size, width, rotation, sticky behavior and utility slots.
The default colors match the Beatnik palette. Keep text and hover colors at an
AA contrast ratio against the selected background when changing these controls.
Utility slots appear at desktop widths (768px and above). Each can show a menu,
social icons, or the country/language form. The forms retain explicit Apply
buttons and work without JavaScript. Country selection determines the available
market currency; this is not an independent currency switcher.

A plain announcement with a URL uses a full-message link. If the rich text has
its own links or the block includes details, the URL becomes a separate CTA to
avoid nested interactive elements. Details page content takes priority over
rich text. The Details link opens a native modal with Escape dismissal, focus
containment and focus restoration. Without JavaScript it links to the details
content using a CSS target fallback.

## Countdown dates

Enter the end date as `YYYY-MM-DD HH:MM` and a separate numeric UTC offset such
as `+00:00`, `-06:00` or `+05:30`. Choose the offset that applies at the target
date; daylight saving transitions are not inferred. All shoppers see the same
instant regardless of their device timezone. Invalid dates or offsets suppress
the timer. Countdown changes are not announced every second by screen readers.
Expired messages either show the configured expiry text or leave rotation.

## Layout and accessibility

All messages, expiry texts and control footprints reserve space from the first
CSS layout. The grid uses the tallest content instead of measuring an initial
slide in JavaScript. Hidden or expired slides retain their layout contribution,
so even when every message expires the bar keeps its reserved space. Longer
messages can increase the bar's height; they are never clipped to a fixed row.

Sticky announcements and the header share a sticky wrapper in normal document
flow. This avoids a first-frame dependency on a JavaScript height measurement.
`--announcement-bar-height` reports the sticky announcement's measured height
(or zero for nonsticky mode) for other theme consumers. With sticky announcements,
the header stays visible with the bar; its prior reveal-on-scroll transform is
disabled. In nonsticky mode the bar scrolls away and the existing header behavior
continues.

Autoplay pauses for focus, optional hover, touch, background tabs, modal details
and editor block selection. A persistent Pause/Resume button is provided even
if arrows are disabled. Reduced-motion users start paused and can explicitly
resume; slide transitions remain disabled. Manual navigation uses a polite live
status, while automatic navigation avoids unsolicited screen reader updates.

## Validation

Run `npm run check` for structure/schema/reference checks, cart regressions,
announcement regressions and Shopify Theme Check. Announcement tests cover
fixed offsets, invalid dates, expiry, composed pause reasons, teardown and the
interaction between countdown ticks and autoplay deadlines.

Before publishing, verify in a Shopify development preview:

- Desktop and mobile, long messages, inline links, both utility slots and zoom.
- Keyboard navigation, screen reader announcements, Pause/Resume, reduced motion.
- Dialog open, Tab containment, Escape/backdrop close and restored focus.
- Countdown expiry for each behavior and actual country/language submissions.
- Header stickiness while scrolling in both modes.
- Theme Editor block selection/deselection and section reload/removal.
- Layout shifts using browser performance tools on a fresh load.

Automated checks do not replace these storefront and assistive-technology checks.
