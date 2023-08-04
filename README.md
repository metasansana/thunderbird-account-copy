# Thunderbird Account Copy

A Thunderbird plugin for copying data between mail accounts.

This extension allows the following data to be copied between two Thunderbird
accounts:

1. Message Filters
2. Folders
3. Messages

Messages are copied as a consequence of copying folder structures. When copying
folders, TBAC replicates the folder tree in the destination account found in 
the source account. Two or more accounts cannot have the same folder name at 
the same path so TBAC merges existing folders together by copying over the 
messages from the source account over.

## Installation

You can clone this project or download a release and install the extension by
selecting the manifest file from Thunderbird. More information can be found
at the following link:

https://developer.thunderbird.net/add-ons/hello-world-add-on#installing

## Usage

Once installed, the TBAC icon will appear on your toolbar. Clicking on it
brings up the extension page where you can initiate the copy process. This 
extension is written to work in a "Wizard" style fashion and is relatively 
straightforward. Clicking "Start" commences the first copy process and "Continue"
the second etc.

Before copying any filters or folders, you will be warned about potential 
conflicts. Message filters are not as strict as folders and you can have more
than one message filter with the same name and rules.

Conflicts between messages are currently not displayed as an inbox can have
as little as 10 messages to as many as 100K! Because folders and messages
are stored on the server, it may take a while for copying to complete.

It's recommended to allow the process to continue even if it appears hung
unless you strongly suspect something has gone wrong. Interrupting the
process is not dangerous per say but you may end up with partially copied
data.

## Limitations and Warnings

Before using this extension, ensure you have made a backup of your profile 
folder. Copying of accounts is more or less a one way operation and there is
**no** support for undoing a copy. You will have to delete the copied filters,
messages and folders yourself under those circumstances or ideally, restore
your profile.

## License

Apache 2.0 + MIT
