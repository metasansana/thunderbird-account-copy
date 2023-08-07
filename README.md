# Thunderbird Account Copy

A Thunderbird plugin for copying data between mail accounts.

**Note: Before using please read the Limitations and Warnings section.**

This extension allows the following data to be copied between two Thunderbird
accounts:

1. Message Filters
2. Folders
3. Messages

Messages are copied as a consequence of copying folder structures. When copying
folders, TBAC replicates the folder tree in the destination account found in 
the source account.

## Installation

To install, download the latest release from [Github](https://github.com/metasansana/thunderbird-account-copy/releases)
and install the extension through the add-on manager. Alternatively, you can clone these sources 
and select the manifest file from Thunderbird.

More information can be found at the following link:

https://developer.thunderbird.net/add-ons/hello-world-add-on#installing

## Usage
Once installed, the TBAC icon will appear on your toolbar. Clicking on it
brings up the extension tab where you can start copying between accounts.
This extension is written to work in a "wizard" style and is relatively 
straightforward. Clicking "Start" commences the first copy process and "Continue"
the second etc.

Before copying any filters or folders, you will be warned about potential 
conflicts.

### Message Filters
The first step in the copy process is to copy message filters (unless skipped).
Message filters are considered to be in conflict if both of the following are true:
1. The destination account has a message filter with the same name.
2. The destination message filters has the same rules as the filter to be copied.

Filters that have the same name but different conditions are *not* currently treated
as a conflict. Once all the filters have been copied you will receive a prompt indicating
the operation was sucessful.

### Message Folders
The next step in the process is copying message folders (unless skipped).

A folder name within a folder tree is unique and is considered a conflict
if copying would create a folder with the same name. For that reason, this
extension merges instead of copying folders that already exist.

Conflicts between messages are currently not displayed as an inbox can have
as little as 10 messages to as many as 100K! Because folders and messages
are stored on the server, it may take a while for copying to complete.

It's recommended to allow the process to continue even if it appears hung
unless you strongly suspect something has gone wrong. Interrupting the
process is not dangerous per say but you may end up with partially copied
data.

Once the operation is complete the extension displays a prompt about success.

## Hiding TBAC Icon
If you want to hide the extension's icon from your toolbar, you can right on an
empty space on the toolbar and select "Customize". Drag the icon onto the dialog
that pops up or do the reverse to restore the icon. More info here:

https://support.mozilla.org/en-US/kb/how-customize-toolbars#

## Limitations and Warnings

### Back Up Your Profile
Before using this extension, ensure you have made a backup of your profile 
folder. Copying of accounts is more or less a one way operation and there is
**no** support for undoing a copy. You will have to delete the copied filters,
messages and folders yourself or ideall restore your profile from a backup.

### Conflicts
When conflicts are encountered, TBAC gives you two options:
1. Cancel copying.
2. Continue copying including the conflicting data.

If you choose 1, be aware that the previous step (copying message filters) will not be undone.
If you chose to continue keep in mind that:

For message filters, duplicate message filters will appear in the destination account's message
filter dialog which may not be desirable if you have a lot filters. 

Folders will be merged however the messages in the destination them will be duplicated.

## License

Apache 2.0 + MIT
