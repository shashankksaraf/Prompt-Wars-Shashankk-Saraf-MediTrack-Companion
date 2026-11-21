# MediTrack Companion

MediTrack Companion helps people who manage daily medicines, especially older adults, answer two questions: “What is scheduled next?” and “Did I already record it?” Built for PS02, Smart Medicine Reminder, at the Prompt Wars hackathon at Gauhati University.

[Open MediTrack Companion](https://shashankk-saraf-meditrack-companion.vercel.app/app) · [Product website](https://shashankk-saraf-meditrack-companion.vercel.app)

## Try it in one minute

1. Choose **Try an editable demo** to open Priya’s fictional schedule. The demo has its own storage, separate from personal medicines.
2. Open **Manage schedule** and give two medicines the same scheduled time. Today groups them together and shows each medicine’s entered directions.
3. Mark one occurrence as taken. The other stays pending, and the recorded one moves below the remaining schedule with its actual recording time.
4. Refresh to see that the entry persists. Use **Undo** to put that occurrence back in its time group.

## Personal schedules

Choose setup for yourself or someone else, name the schedule, and enter the medicines, directions, and daily times. You can edit or archive a medicine. Today shows pending time groups in order and keeps recorded doses at the bottom. Skipping is an explicit action. Each occurrence has its own record, even when the same medicine appears twice that day.

The device-only tracker stores personal data in this browser. Clearing site data removes that local schedule. Medicine directions come from the person setting up the schedule. The interface uses large text, labelled controls, keyboard focus, and a full-width primary action.

## Implementation and development

React, TypeScript, and Vite power the landing page and tracker. Local storage holds device-only schedules and dose records. A record identifies the medicine, local date, and scheduled time, and captures the directions and actual recording time when an action is recorded.

The participant chose the product scope and directed the milestone reviews. Codex helped plan milestones and review the implementation. Claude Code CLI implemented the application. One review changed how Today behaves when several medicines share a time. Recording one now leaves the other medicines available in the same group, so a single tap cannot mark the entire group taken.

## Build and checks

With Node.js and npm installed, run:

~~~sh
npm ci
npm run lint
npm run build
~~~

Vercel serves the production build. The website opens at the root and the tracker opens at /app.

## Future work

Calendar history and cross-device caregiver accounts are future milestones. A family member can already set up a schedule on the same device. Spoken reminders and prescription upload with a review-and-confirm step were deferred to leave time for verifying the daily tracking workflow.
