# Trackside Selections iPhone app

The iPhone (and Android) app for [tracksideselections.com](https://tracksideselections.com), built with Expo (React Native). It
reads the picks straight from the website, so there's nothing extra to update. When the site's daily scripts publish a new card,
the app shows it.

## What's in the app

| Tab | What it does |
| --- | --- |
| **Picks** | Today's cards and strongest plays, drawn in native screens. Tap a card for every race. |
| **Card screen** | Every race with selections, morning lines, post times and official results. A bell on each upcoming race schedules a phone reminder 10 minutes before post. Share button. |
| **Results** | Every past card by date, plus the full results ledger. |
| **Calculator** | A native ticket calculator (WPS, exacta/trifecta/superfecta box, key and part-wheel, Daily Double, Pick 3 to 6). It uses the same math as the website's calculator. |
| **Learn** | Handicapping guides from the site, opened inside the app. |
| **More** | Reminder management, 1-800-GAMBLER, About, Privacy, Terms, Contact. |

On first launch the app asks the user to confirm they're 21 or older. Every betting screen also shows the "Play responsibly" note.

### App Store notes

* **Guideline 4.2 (minimum functionality).** Apple often rejects apps that only load a website. This app's picks, results and
  calculator screens are native, and it has post time reminders, so it does more than the website alone.
* **Gambling (guideline 5.3).** The app gives tips and information only. It takes no bets and has no real-money gaming, so no
  gambling licence is needed. Answer the age-rating questions honestly: no real-money gambling or contests, but the content
  discusses betting. Expect an adult rating (17+/18+), which matches the site's 21+ rule.
* **Payments (guideline 3.1.1).** VIP Plan, Tip Jar, Cash App, Venmo, PayPal and Buy Me a Coffee links are hidden or blocked
  in the app. Selling VIP inside the app would require Apple in-app purchase. That's left for a later version.
* **Privacy label.** The app has no accounts and no analytics. It stores only the 21+ confirmation and reminders, on the phone.
  In App Store Connect, choose **Data Not Collected**. Ads from the website are removed when site pages open inside the app.

## Releasing to the App Store (no Mac needed)

You build in the cloud with **EAS** (Expo Application Services). Every step runs from any computer with Node.js 20+ installed.

1. **Join the Apple Developer Program** at <https://developer.apple.com/programs/enroll/> ($99 a year). If you have a business,
   enroll it as an organization (it needs a D-U-N-S number). The seller name then reads "Trackside Selections" and not your
   personal name. Approval can take a few days.
2. **Create a free Expo account** at <https://expo.dev/signup>.
3. **Get the code and install:**
   ```bash
   git clone https://github.com/Dakidbose/trackside-app.git
   cd trackside-app
   npm install
   npx eas-cli@latest login
   npx eas-cli@latest init        # links the project to your Expo account (adds an EAS project ID to app.json)
   ```
4. **Build for iPhone.** EAS asks for your Apple ID and creates the certificates and provisioning profile for you:
   ```bash
   npx eas-cli@latest build --platform ios --profile production
   ```
5. **Send the build to App Store Connect.** On the first run, this also creates the app record using the bundle ID
   `com.tracksideselections.app`:
   ```bash
   npx eas-cli@latest submit --platform ios --latest
   ```
6. **Test it on your phone with TestFlight.** Install the TestFlight app, and the build shows up there after Apple processes it
   (about 10 to 30 minutes).
7. **Fill in the App Store listing** in [App Store Connect](https://appstoreconnect.apple.com):
   * Name: *Trackside Selections* · Subtitle: *Horse racing picks & results*
   * Category: Sports (secondary: Reference)
   * Privacy policy URL: `https://tracksideselections.com/privacy.html`
   * Support URL: `https://tracksideselections.com/contact.html`
   * Screenshots: 6.9" iPhone (1320 × 2868) is the only required size. Take them in TestFlight on a large iPhone, or ask for
     simulator screenshots.
   * Age rating questionnaire (see the notes above), then **Submit for Review**.
8. In the review notes, tell Apple: *"Free horse racing selections and results for adults 21+. The app does not accept wagers
   or offer real-money gaming; it links to no sportsbooks. No login is required."*

### Updates

* **Code-only changes** can ship without a new review: `npx eas-cli@latest update --branch production` (after setting up
  `expo-updates`).
* **Everything else:** build again (step 4) and submit (step 5). The build number goes up automatically.

## Developing

```bash
npm install
npx expo start          # scan the QR code with the Expo Go app on your iPhone
npm run typecheck
```

Picks parsing lives in `src/lib/site.ts`. It reads the HTML that the website's `_tools/*.py` scripts produce. If the card layout
on the website changes, update the patterns there.
