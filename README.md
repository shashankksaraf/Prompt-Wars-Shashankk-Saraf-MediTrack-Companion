# MediTrack Companion

MediTrack is a mobile-friendly daily medication schedule built for the PromptWars PS02 challenge. A person or a family member can enter a schedule on the same device. The Today screen lets the user record a scheduled occurrence as taken or skipped, see the recording time, and undo an entry.

## Try the Phase 3A preview

Choose **Try an editable demo** to open Priya’s fictional schedule. Select **Manage schedule**, edit the evening time from 8 PM to 9 PM, and save. Refresh Today to see the edited time. Choose **Exit demo** to return to setup. For your own local schedule, choose **Set up my schedule** or **Set up for someone else**, enter a display name, and add a medicine. Subsequent visits open the named schedule.

Data is stored in the current browser. Use fictional entries when reviewing this prototype. The app tracks entered directions. Reminders are limited to the open app.

## Run locally

With Node.js 22.12 or newer and npm, run `npm ci` and `npm run dev`. Use `npm run build` for the production bundle and `npm run lint` for static checks.

## How it was built

The participant selected the problem and scope. Codex planned and reviewed milestones. Claude Code implemented the React, Vite, and TypeScript application. Review focused on independent scheduled times, local persistence, keyboard access, and preserving recorded details through schedule changes.

## Current review and future expansion

Phase 2 review led to three corrections: demo entries stay separate from personal records, future slots are labelled Upcoming, and a tap after midnight refreshes a stale schedule before recording. Linked caregiver accounts are planned for a later milestone. Voice guidance and background alerts were deferred to focus the timed build on the daily recording flow.
