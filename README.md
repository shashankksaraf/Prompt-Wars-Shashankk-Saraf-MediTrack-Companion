# MediTrack Companion

A daily medicine tracker built for **PS02 · Smart Medicine Reminder** at the Prompt Wars hackathon at Gauhati University. [Try the editable demo](https://shashankk-saraf-meditrack-companion.vercel.app/app) or [visit the product website](https://shashankk-saraf-meditrack-companion.vercel.app).

## The problem and the person using it

The challenge was to help people organise and track daily medication, especially older adults who find it difficult to remember their schedules. I designed for someone looking at two medicines scheduled for 8 AM and wondering, “Which one have I already taken?” A family member can help enter the schedule on the same device, and the person taking the medicine can handle the daily check-in.

## Choosing a solution

I considered spoken reminders, reading a prescription into a draft schedule, and letting a caregiver manage medicines remotely. I started with the decision the user faces every day. The Today screen groups medicines that share a time and gives each one its own large button. Recording the first 8 AM medicine leaves the second visible at the top. The recorded one moves down, with the time the user actually tapped.

## How I built it with two AI tools

I chose the scope and worked in small milestones. I used Codex to discuss the user journey, turn each decision into a prompt with a concrete check, and review what changed. Claude Code CLI implemented the app in React and TypeScript. For example, we checked that recording a morning dose and refreshing the page preserved that entry while leaving the evening dose of the same medicine pending. That example helped us decide how to identify each scheduled dose.

## A decision during the competition

An internet outage interrupted the time available for hosted testing. Remote caregiver access was still awaiting verification, so I kept the submission focused on the device-only tracker. Dated calendar history also stayed outside the submitted version.

## The final product

Open the app to try a fictional schedule or create your own. Enter medicine names, directions, and times. On Today, mark each dose taken or skipped, or use Undo if you tapped by mistake. You can edit the schedule as it changes. The schedule and recorded entries stay in the same browser after refresh.
