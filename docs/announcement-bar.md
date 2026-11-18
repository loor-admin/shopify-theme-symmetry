# Announcement bar: admin configuration guide

This guide covers the announcement bar implemented in the LOOR Shopify theme.
It appears above the main header and supports up to **12 announcement blocks**.
Each block has its own message, optional link, countdown and details popup.
Appearance, rotation and desktop utility slots are managed for the whole section.

## Open the settings

1. Open the theme you want to edit in Shopify's theme editor.
2. Expand the **Header** group and select **Announcement bar** to edit section settings.
3. Select an **Announcement** block underneath it to edit a specific message.
4. Preview the desktop and mobile layouts, then save your changes.

If the section is missing, add **Announcement bar** to the Header group, place it
above **Editorial header**, and add at least one Announcement block. Only one
announcement-bar section can be added to this group. Editing an unpublished theme
affects that theme's preview; confirm you are viewing the same theme on the storefront.

## Manage announcements

- **Add:** Add an Announcement block under Announcement bar.
- **Edit:** Select the block and update its text, destination or optional features.
- **Reorder:** Drag blocks into the order in which customers should see them.
- **Hide or remove:** Use the theme editor's block visibility or removal controls.
- **Disable the entire bar:** Hide the Announcement bar section in the theme editor.

One enabled message displays as a static announcement. Multiple eligible messages
can rotate or be navigated manually. Selecting a block in the editor displays that
block and pauses rotation while it is selected, including an expired block.

## Section settings: appearance

These settings apply to every announcement and both utility slots.

| Setting | Default | What the admin can manage |
| --- | --- | --- |
| Background | `#F9F6F0` | Background color of the bar. The background spans the available width in both width modes. |
| Text | `#1A1A1A` | Text and inherited icon/control color. |
| Link hover accent | `#89432F` | Hover color for links and buttons. |
| Bottom border | `#E5E0D8` | Color of the 1px separator beneath the bar. |
| Show bottom border | On | Shows the separator. Turning it off makes the border transparent while retaining its space. |
| Content width | Container (1440px) | Choose **Full width** or **Container (1440px)**. Container limits the inner layout to 1440px; full width allows it to span the available width, with side padding. |
| Vertical padding | Compact | **Compact** adds 4px above and below the inner layout; **Standard** adds 10px. Text and controls also have their own padding, so these are not total bar heights. |
| Font size | 12px | Choose **12px** or **13px** for announcement typography. Utility form controls use their own sizes. |
| Sticky behavior | Sticky with header | **Sticky with header** keeps the announcement and main header together at the top while scrolling. **None** lets the announcement scroll away while preserving the main header's existing scroll behavior. |

Keep text, link and hover colors readable against the selected background. The
message area uses tracked sans-serif typography and supports wrapping. The bar's
height follows its tallest message or expiry text to avoid jumping during rotation.
Removing expired announcements from rotation does not collapse their reserved space.

With **Sticky with header**, the main header remains visible with the announcement;
its separate reveal-on-scroll animation is disabled while the two are grouped.

## Section settings: rotation and controls

| Setting | Default | What the admin can manage |
| --- | --- | --- |
| Auto-rotate | On | Automatically cycles through multiple eligible messages. Turn it off for manual navigation. |
| Show previous and next arrows | On | Shows chevron buttons when at least two messages are eligible. Turning this off does not turn off autoplay. |
| Pause on hover | On | Pauses autoplay while a mouse pointer is over the bar. |
| Rotation interval | 5 seconds | Choose **3–10 seconds**, in 1-second increments, between automatic changes. |

The bar also pauses automatically when keyboard focus is inside it, while details
are open, during a touch gesture, while the browser tab is hidden, or while an
announcement block is selected in the editor. These behaviors have no admin toggles.
When those temporary conditions end, autoplay resumes if Auto-rotate is enabled and reduced motion is not requested.

The bar has no visible Pause/Resume control. Visitors who prefer reduced motion have
autoplay and transition animations disabled; arrows and swipes remain available.
Mobile visitors can swipe horizontally to move between messages. If autoplay and
arrows are both disabled, desktop visitors have no visible navigation controls;
keep arrows enabled when you want customers to explore multiple messages manually.

## Section settings: desktop utility slots

At **768px and wider**, the layout is:

**Left utility slot | Announcement messages | Right utility slot**

Below 768px, both utility slots are hidden and the announcement area remains visible.
Put essential customer-facing messages in announcement blocks rather than relying
on a desktop utility slot.

| Setting | Default | What the admin can manage |
| --- | --- | --- |
| Left utility slot | None | Choose **None**, **Social icons**, **Utility menu**, or **Country and language**. |
| Left utility menu | Not selected | Select the existing Shopify menu to render when the left slot is set to Utility menu. Only its top-level links appear. |
| Right utility slot | None | Choose **None**, **Social icons**, **Utility menu**, or **Country and language**. |
| Right utility menu | Not selected | Select the existing Shopify menu to render when the right slot is set to Utility menu. Only its top-level links appear. |
| Show country / currency | On | Includes the country/currency selector in any Country and language slot when Shopify supplies more than one available country. |
| Show language | On | Includes the language selector in any Country and language slot when Shopify supplies more than one available language. |
| Instagram URL | Blank | Profile URL used by the Instagram icon in any Social icons slot. Blank means no Instagram icon. |
| Facebook URL | Blank | Profile URL used by the Facebook icon in any Social icons slot. Blank means no Facebook icon. |
| Youtube URL | Blank | Channel URL used by the YouTube icon in any Social icons slot. Blank means no YouTube icon. |

Both sides use the same social URLs and country/language visibility settings. The
menu selection is separate for each side. A menu selection does nothing until its
slot is set to **Utility menu**. Social icons appear only for populated URLs.
Use short utility menus, such as **Stores** and **Help**, to keep the desktop bar compact.

Country and language options come from Shopify's available localization data; the
theme does not create markets, currencies or languages. Customers select options
and press **Apply**. Selecting a country determines its market currency; the bar
does not offer an independent currency switcher. The form supports submission
without JavaScript. If both country and language controls are unavailable or disabled,
choose another slot type or **None** to avoid an unneeded Apply button.

## Announcement block settings: message and links

These settings apply only to the selected block.

| Setting | Default | What the admin can manage |
| --- | --- | --- |
| Announcement | Considered pieces. Everyday stories. | Message text, with bold, italic and inline links. Keep the main point brief for mobile readers. |
| Message link | Blank | Optional destination URL. With a plain message and no details popup, the message itself becomes a link. |
| Link label | Shop now | Label for the separate Message link CTA when the message already contains an inline link or has details content. It is not used for a full-message link. |

Link behavior depends on the content:

| Configuration | Customer experience |
| --- | --- |
| Message only | Plain announcement text. |
| Message + Message link, without inline links or details | Clicking the message follows the Message link. |
| Message with an inline link + Message link | Inline links retain their own destinations; a separate CTA uses Message link and Link label. |
| Message with details content | A separate **Details** link opens the popup. The announcement text itself is not a popup trigger. |
| Details content + Message link | Details opens the popup; the separate CTA follows Message link. |

The **Details** label is a theme translation string, rather than a per-block label.

## Announcement block settings: countdown

| Setting | Default | What the admin can manage |
| --- | --- | --- |
| Show countdown timer | Off | Enables a live countdown beside this block's announcement text. |
| End date and time | Blank | Required for a running timer. Enter `YYYY-MM-DD HH:MM` using a 24-hour clock. |
| UTC offset | `+00:00` | Offset that applies at the target date/time, such as `-06:00` or `+05:30`. |
| When countdown expires | Show expired text | Choose **Hide announcement** or **Show expired text**. |
| Expired text | This offer has ended. | Replacement message used by Show expired text. |

The display is **DD : HH : MM : SS**: days, hours, minutes and seconds. It appears
inline beside the message and can wrap onto another line when space is limited.
It counts toward one fixed instant for all visitors, regardless of device timezone.

### Set up a timed announcement

1. Add the announcement text, such as **Our holiday offer ends in**.
2. Turn on **Show countdown timer**.
3. Enter an end date and time, for example **2027-12-01 23:59**.
4. Enter the UTC offset that applies at that destination and date. For a deadline
   expressed in US Central Standard Time, use **-06:00**.
5. Select the expiry behavior and, if applicable, write the replacement text.
6. Save and preview the countdown.

Use **+00:00** for UTC, **-06:00** for CST, **-05:00** for CDT, or **+05:30** for
India Standard Time. Offset format must include the sign, two-digit hours, colon
and two-digit minutes. The implementation accepts offsets from -14:00 to +14:00.
It validates calendar dates and does not infer daylight saving time. Choose the
offset that applies **at the deadline**, not necessarily today's offset.

Blank or invalid dates/offsets suppress the running timer. A valid deadline already
in the past applies the selected expiry behavior immediately. Turning the countdown
off also turns off its expiry processing; the announcement remains a normal message.

**Hide announcement** removes the block from customer rotation. **Show expired text**
replaces the entire announcement message area, including its links, timer and Details
trigger, with Expired text. The popup content is not a separate scheduled offer.
Expiry controls the announcement's presentation only: it does not activate or stop
Shopify discounts, change prices, or enforce offer eligibility. Configure those
separately in Shopify.

If all announcements expire with Hide announcement, the bar retains its reserved
height; desktop utility slots can remain visible. Hide the section manually when
you want to remove the entire bar.

## Announcement block settings: details popup

| Setting | Default | What the admin can manage |
| --- | --- | --- |
| Details title | Announcement details | Heading displayed inside the popup. Give it a descriptive title, such as Shipping details. |
| Details content | Blank | Rich text displayed inside the popup when no Details page is selected. |
| Details page | Not selected | Select an existing Shopify page and use its body content in the popup. It takes priority over Details content. |

Adding Details content or selecting a Details page enables the **Details** link;
there is no separate popup toggle. A Details title alone does not enable it.
To disable the popup, clear both Details content and Details page.

The popup uses a warm neutral surface and crisp borders. Customers can close it
with **Close**, Escape, or a click outside the dialog. Keyboard focus stays inside
the open dialog and normally returns to its trigger on closing. Rotation pauses
while it is open. With JavaScript unavailable, Details uses a linked content fallback.

The chosen page's body content is rendered in the dialog, rather than its full page
template. The block's Details title remains the dialog heading. Updating that page
also updates the popup content wherever it is used.

## Configuration examples

| Goal | Suggested configuration |
| --- | --- |
| One brand message | One Announcement block; countdown off; leave Message link blank. |
| Shipping information | Announcement: Free express shipping — see details. Add a descriptive Details title and shipping terms in Details content. |
| Timed offer | Announcement: Offer ends in. Turn on Show countdown timer, supply a future deadline and offset, add Message link, and select an expiry behavior. |
| Rotating store messages | Add several blocks; enable Auto-rotate and arrows; use a 5–7 second interval; keep Pause on hover on. |
| Desktop service links | Set one utility slot to Utility menu and select a short menu containing Stores and Help. |
| Desktop localization | Set one utility slot to Country and language; enable the desired selectors and confirm available countries/languages in Shopify. |
| Desktop social links | Set a slot to Social icons and populate one or more social URLs. |

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Bar is missing | Confirm you are viewing the edited theme; the section is in the Header group, above the header, and not hidden; at least one visible block exists. Check whether every timed block has expired with Hide announcement. |
| Bar is blank but still occupies space | All timed messages may have expired with Hide announcement, or the message/expiry text may be blank. Check contrast as well. |
| Bar missing after a GitHub schema failure was fixed | Confirm `sections/announcement-bar.liquid` and `sections/header-group.json` both saved successfully. A later sync may only retry changed files. Reapply the header group or add the section and a block through the editor. |
| Countdown is missing | Turn on Show countdown timer and enter a valid date/time and signed UTC offset. A past deadline triggers expiry immediately. |
| Countdown is off by an hour | Check the offset at the deadline, including daylight saving time. The timer does not infer timezones from region names. |
| Messages are not rotating | Check Auto-rotate and the number of unexpired blocks. Move focus/pointer away, close details, deselect the editor block, and check reduced-motion preferences. |
| Arrows are missing | Enable Show previous and next arrows and ensure at least two eligible messages exist. |
| Utility slots disappear on mobile | Expected below 768px. Essential information should also be available elsewhere. |
| Social icons are missing | Select Social icons for a slot and populate the corresponding profile URLs. |
| Country/language selector is missing | Select Country and language for a slot, enable the desired control, and confirm Shopify supplies more than one option. Also check desktop width. |
| Wrong content appears in the popup | Details page takes priority over Details content. Clear the page selection to use the rich text. |
| Message link appears as a separate CTA | Expected when the message contains an inline link or has popup details. Edit Link label to name the CTA. |
| GitHub reports that documentation/tests were ignored | Expected: Shopify theme uploads ignore development files such as `docs/`, `scripts/` and `package.json`. Those warnings do not prevent valid theme files from loading. |

## Admin preview checklist

- Confirm the intended message order and links on desktop and mobile.
- Check readability, long text wrapping, both utility slots and sticky behavior.
- Test automatic pausing on focus/hover, arrows and mobile swipes when using multiple messages.
- Open each popup and confirm its title, content, Close action and keyboard behavior.
- Check the countdown deadline and offset; preview both expiry behaviors.
- Submit country and language changes using Apply where those controls are available.
- Save and preview the correct theme before publishing.

## Technical reference for maintainers

| File | Purpose |
| --- | --- |
| `sections/announcement-bar.liquid` | Announcement markup, section settings and block schema. |
| `assets/announcement-bar.js` | Rotation, countdowns, touch gestures, dialogs, editor events and height reporting. |
| `assets/announcement-bar.css` | Responsive layout, typography, transitions, reserved slide space and popup styles. |
| `snippets/announcement-utility.liquid` | Utility menu and localization rendering. |
| `snippets/social-icons.liquid` | Instagram, Facebook and YouTube icons and links. |
| `sections/header-group.json` | Initial section placement and saved configuration. |
| `layout/theme.liquid` | Loads the assets and wraps the header group for shared sticky behavior. |
| `locales/en.default.json` | Default translations for controls and accessible labels. |

Assets load once from the layout and support theme-editor section reloads. Sticky
announcements and the header share a wrapper in normal flow, so header alignment
does not depend on a first-frame JavaScript measurement. `--announcement-bar-height`
reports the measured sticky announcement height, or zero in nonsticky mode.
Inactive slides remain in the sizing grid but are removed from interaction and
accessibility navigation. Countdown updates do not announce every second; manual
slide navigation uses a polite live status.

Run `npm run check` for structure/schema/reference checks, cart regressions,
announcement regressions and Shopify Theme Check. Browser layout-shift measurement,
real localization submissions, assistive-technology testing and live Theme Editor
behavior still require a Shopify preview. Automated checks do not establish full
accessibility compliance or replace storefront verification.
