# MeetFair

Fair meeting times across timezones.

**Startup idea:** distributed teams schedule recurring pain - the same person always takes the 7am or 10pm call because timezone math is invisible. MeetFair makes the tradeoff explicit: everyone declares their timezone and acceptable local hours, the app finds every workable UTC slot and ranks it by total pain (distance outside 9-18 core hours), fairest first.

## Use

Open `app.html`. Add each person with their UTC offset and the local hours they'll take meetings. The workable slots appear ranked - "everyone in work hours" down to "someone pays" - with each person's local time shown. Data persists in localStorage.

## Engine

`engine.js` holds the pure scheduling logic (local-hour math with fractional offsets, window fit, pain scoring, slot ranking) and is covered by node tests. The UI is a thin render layer over it.

Part of the hourly app factory - 60+ small tools, one per hour.
