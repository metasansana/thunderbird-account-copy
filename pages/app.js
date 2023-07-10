import * as events from '/events.js';

/**
 * AppController is the main class for the content tab of this extension.
 */
class AppController {

  /**
   * @type {HTMLSelectElement}
   */
  srcSelect;
 
  /**
   * @type {HTMLSelectElement}
   */ 
  destSelect;

  /**
   * @type {HTMLButtonElement}
   */
  startButton;

  /**
   * @type {MailAccount[]}
   */
  accounts = [];

  targets = { source: '', destination: '' }

  /**
   * @param  {MailAccount[]}
   * @return {DocumentFragment}
   */
  _getAccountOptions(accounts) {
    let options = document.createDocumentFragment();
    let defaultVal = document.createElement('option');
    defaultVal.textContent = 'Select an account';
    options.appendChild(defaultVal);
    for(let act of accounts) {
      let option = document.createElement("option");
      option.value = act.id;
      option.textContent = act.name;
      options.appendChild(option);
     }
    return options;
  }

  /**
   * @param {Event} evt
   */
  handleEvent(evt) {

    switch(evt.type) {

      case "change":
      this.targets[evt.target.id] = evt.target.value;
       if(this.targets.source && this.targets.destination) 
        this.startButton.removeAttribute("disabled");
      break;

      case "click":
         this.startCopy();
      break;

      default:
        break;
    }

  }

  startCopy() {

  }

  async run() {
  
    this.srcSelect= document.getElementById("source");
    this.destSelect = document.getElementById("destination");
    this.startButton = document.getElementById("start");
    this.accounts = await send({ type: events.EVENT_LIST_ACCOUNTS });
  
    this.srcSelect.replaceChildren(this._getAccountOptions(this.accounts));
    this.destSelect.replaceChildren(this._getAccountOptions(this.accounts));
    
    this.srcSelect.addEventListener("change", this);
    this.destSelect.addEventListener("change", this);
    this.startButton.addEventListener("click", this);

  }

  static main() {

    let ctl = new AppController();
    window.addEventListener("load", ()=> ctl.run());

  }

}

const send = evt => browser.runtime.sendMessage(evt);

AppController.main();
