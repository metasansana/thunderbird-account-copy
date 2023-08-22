# Thunderbird Account Copy

A Thunderbird plugin for copying data between mail accounts.

**Note: Before using, please read the Limitations and Warnings section.**

This extension allows the following data to be copied between two Thunderbird
accounts:

1. Message Filters
2. Folders
3. Messages

This version of TBAC is useful mainly to duplicate messages and filters into an empty
account, such as when changing email providers.  A future version may handle update-style
copies, for example to maintain the same set of filters in multiple accounts by editing
them in one place and copying them to others incrementally.

Messages are copied as a consequence of copying folder structures. When copying
folders, TBAC replicates the source account folder tree in the destination account,
using any same-name folders already there and not deleting any existing folders.
New messages and filter rules appear along with any existing messages and filter
rules; nothing is deleted.

## Installation

To install, download the latest release from [Github](https://github.com/metasansana/thunderbird-account-copy/releases),
and install the extension through the add-on manager. Alternatively, you can clone these sources 
and select the manifest file from Thunderbird.

More information can be found at the following link:

https://developer.thunderbird.net/add-ons/hello-world-add-on#installing

## Usage
Once installed, the TBAC icon will appear on your toolbar. Clicking on it
brings up the extension tab, where you can start copying between accounts.
This extension is written to work in a "wizard" style and is relatively 
straightforward. Clicking "Start" commences the first copy process. Clicking 
"Continue" starts the second.

Before copying any filters or folders, you will be warned about potential 
conflicts.

### Message Filters
The first step in the copy process is to copy message filters (unless skipped).
Message filters are considered to be in conflict if both of the following are true:
1. The destination account has a message filter with the same name.
2. The matching destination message filter has the same rules as the filter to be copied.

Filters that have the same name but different conditions are *not* currently treated
as conflicts. Once all the filters have been copied, you will receive a message indicating
the operation was successful.

### Message Folders
The next step in the process is copying message folders (unless skipped).

Duplicating a folder name at the same tree position is not possible, so this
extension merges instead of copying folders that already exist.

Conflicts between messages are currently not displayed, as an inbox can have
as many as 100,000 messages. Depending on where messages are stored (server or local)
and how many messages there are, it may take considerable time for copying to complete.

You should allow the copying process to continue even if it appears hung,
unless you strongly suspect something has gone wrong. Interrupting the
process is not dangerous per se, but you may end up with partially copied
data. A subsequent copy would re-copy all already-copied messages, unless
you first delete everything that was initially copied.

Once the operation is complete, the extension displays a success message.

## Hiding TBAC Icon
If you want to hide the extension's icon from your toolbar, you can right click on an
empty space on the toolbar and select "Customize". Drag the icon onto the dialog
that pops up or do the reverse to restore the icon. More info is here:

https://support.mozilla.org/en-US/kb/how-customize-toolbars#

## Limitations and Warnings

### Back Up Your Profile
Before using this extension, ensure you have made a backup of your profile 
folder [NOTE: MOST USERS DON'T KNOW WHAT THIS IS OR HOW TO DO IT!]. Copying of accounts is more or less a one-way operation and there is
**no** support for undoing a copy. You will have to delete the copied filters,
messages, and folders yourself, or ideally restore your profile from a backup. Once you
are happy with the copy, you can delete the backup, if you wish.

### Conflicts
When conflicts are encountered, TBAC gives you two options:
1. Cancel copying.
2. Continue copying including the conflicting data.

If you choose 1, be aware that the previous step (copying message filters) will not be undone.
If you chose to continue, keep in mind that:

For message filters, duplicate message filters will appear in the destination account's message
filter dialog, which may not be desirable if you have a lot filters.

Folders will be merged; however, the messages in the destination will then be duplicated.

## License

Apache 2.0 + MIT
