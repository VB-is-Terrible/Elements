'use strict'

// Implements x-timerCard, x-timerInputCard, x-timerNotificationCard,
// via XTimerCardProto, XtimerInputCard, XTimerNotificationCard

// For timerObjs, if type === 'timer',
// time is Date object at the time the timer ends
// if type === 'alarm',
// time is the number of seconds from midnight that the alarm should activate on

// When adding a timer/alarm to the x-timerCards,
// They will return a id number
// The same id number will be given via event.id when a timer/alarm is removed
// And the id is passed to x-timerCard.remove

// x-timerCard.tick updates the timers. Use this to synchronize UI updates,
// Calling it with longer than 1 (one) secomd intervals allows for decresed UI
// update speed

// Roadmap:

// Finish implementing notificationCard:
//    dismiss           done
//    dismissAll        done
//    remove            done
//    repeat            done
//    refactor          done
//    saving            done
//    QA                working on it


// Feature freeze

// Change outdated API calls to newer shinier versions
// Document functions, especially expected inputs, whether it expects
// an event or timerObjs

// Refactor to use the class syntactic sugar
// Wrap the cards within one big element

// Produce public apis to change properties of the cards
// e.g. audio duration and volume
// and implement appropriate backends

// NOTE: Delayed until firefox supports v1
// Change shadow DOM from v0 to v1

// End feature freeze

// Make shinier (maybe animations?)
// Make it easier to switch between timer and alarm
// timer to fire on time feature
// Disable unusable buttons in XNotification card





const MaxID = Math.pow(2,32) //2**32 // That ES7 expontent operator
const notificationDone = true;

// Start up code

const randint = (lower, upper) => {
   return Math.floor(Math.random() * (upper - lower) + lower);
};

const strPad = (str, length, fill = ' ', direction = true) => {
   // direction: true = left, false = right
   let padLen = Math.max(Math.ceil((length - str.length) / fill.length), 0);
   let fillStr = fill.repeat(padLen);
   let returnStr = '';
   if (direction === true) {
      returnStr = fillStr + str;
   } else {
      returnStr = str + fillStr;
   }
   return returnStr;
};


//x-timerCard implemenation


let XTimerCardProto = Object.create(HTMLElement.prototype);

XTimerCardProto.createdCallback = function () {

   let shadow = this.createShadowRoot();
   let card = document.importNode(
      document.querySelector('#templateTimerCard'),
      true);
   let title = card.content.querySelector('#title');

   //Prevents race condition when object was made before definition

   let titletext = 'Error: title not set';
   if (this.title !== undefined && this.title !== "") {
      titletext = this.title;
   }
   this.setAttribute('title', titletext);


   Object.defineProperty(this, 'hidable', {
      value: false,
      writable: true,
      enumerable: true,
      configurable: false
   });

   //Set readonly properties
   //Bad things happen when these properties are tinkered with
   Object.defineProperty(this, 'timers', {
      value: [],
      writable: false,
      enumerable: true,
      configurable: false
   });

   title.innerText = this.title;
   this.previous = 0;
   shadow.appendChild(card.content);

};

XTimerCardProto.attributeChangedCallback = function (
   attrName, oldValue, newValue) {
   //console.log('ChangeAttr', attrName, oldValue, newValue);
   switch (attrName) {
      case 'title':
         this.shadowRoot.querySelector('#title').innerText = newValue;
         break;
      case 'hidable':
         console.warn('hidable: NotImplementedError');
      default:
         //this.
   }
};


XTimerCardProto.add = function (timerInputObj) {
   let clone = document.importNode(
      document.querySelector('#templateTimer'),
      true);

   let input = clone.content.querySelector('.time');
   let button = clone.content.querySelector('button.action');
   if (timerInputObj.type == 'alarm') {
      button.innerText = 'Remove';
   } else if (timerInputObj.type == 'timer') {
      button.innerText = 'Stop';
   } else {
      button.innerText = timerInputObj.type;
   }
   let [idObj, onclick] = this._createId(timerInputObj);

   if (timerInputObj.type === 'alarm') {
      input.innerText = this._timerToString(idObj.assoc, idObj.type);
   } else if (timerInputObj.type === 'timer') {
      input.innerText = this._timerToString(
         idObj.assoc,
         idObj.type);
   }
   clone.content.querySelector('button.action').addEventListener('click', onclick);
   this.shadowRoot.querySelector('#card').appendChild(clone.content);
   let active = this.shadowRoot.querySelector('#card');
   idObj.div = active.children[active.children.length - 1];
   this._update();
   return idObj.id;

};

XTimerCardProto._createId = function (timerInputObj) {
   // Reduces variables kept in closure
   let newObj = {
      id : randint(0, MaxID),
      div: null,
      assoc: timerInputObj.time,
      type: timerInputObj.type
   };
   this.timers.push(newObj);
   let onclick = (e) => {
      this.remove(newObj.id);
   };
   return [newObj, onclick];
};

XTimerCardProto.remove = function (id, noEvent = false) {
   let containerObj = null;
   let location = -1;
   for (let i = 0;i < this.timers.length;i++) {
      if (this.timers[i].id == id) {
         containerObj = this.timers[i];
         location = i;
      }
   }
   if (containerObj === null) {
      console.error('Invalid id: %s', id);
   } else {
      this.shadowRoot.querySelector('#card').removeChild(containerObj.div);
      this.timers.splice(location, 1);
      this._update();

      if (noEvent === false) {
         let removeEvent = new CustomEvent('remove');
         removeEvent.id = id;
         this.dispatchEvent(removeEvent);
      }
   }
};

XTimerCardProto._update = function () {
   this.previous = this.timers.length;
};

XTimerCardProto._timerToString = (time, type = 'timer') => {

   let str = '';
   if (type === 'alarm') {
      let hr = Math.floor(time / 3600);
      let min = Math.floor(time / 60) % 60;
      let sec = time % 60;

      str = strPad(hr.toString(), 2, '0') + ':' +
            strPad(min.toString(), 2, '0');
   } else if (type === 'timer') {
      let diff = Math.floor((time - Date.now())/1000);
      let hr = Math.floor(diff / 3600);
      let min = Math.floor(diff / 60) % 60;
      let sec = diff % 60;

      str = strPad(hr.toString(), 2, '0') + ':' +
            strPad(min.toString(), 2, '0') + ':' +
            strPad(sec.toString(), 2, '0');
   }
   return str;
};

XTimerCardProto.tick = function () {
   let now = new Date;
   let input = null;
   for (let i = 0;i < this.timers.length; i++) {
      if (this.timers[i].type === 'timer') {
         input = this.timers[i].div.querySelector('.time');
         input.innerText = this._timerToString(this.timers[i].assoc , this.timers[i].type);
      }
   }
};


let XTimerCard = document.registerElement('x-TimerCard', {
    prototype: XTimerCardProto
});


//x-timerInputCard

let XTimerInputCardProto = Object.create(HTMLElement.prototype);

XTimerInputCardProto.createdCallback = function () {

   let shadow = this.createShadowRoot();
   let card = document.importNode(
      document.querySelector('#templateTimerInput'),
      true);
   let l = card.content.querySelector('#timerInput').querySelectorAll('input.numInput');
   for (let i = 0;i < l.length;i++) {
      l[i].placeholder = '00';
      l[i].min = '0';
   }
   let selector = card.content.querySelector('#typeSelector');
   let timeInput = card.content.querySelector('#timerInput');
   let alarmInput = card.content.querySelector('#alarmInput');
   selector.value = 0;
   alarmInput.hidden = true;
   let onselect = (e) => {
      switch (selector.value) {
         case '0':
            timeInput.hidden = false;
            alarmInput.hidden = true;
            break;
         case '1':
            timeInput.hidden = true;
            alarmInput.hidden = false;
            break;
         default:
            console.log('Something has gone horribly wrong');
      }
   };
   timeInput.querySelector('#confirmTime').addEventListener(
      'click',
      (e) => {this._timer(e);});
   alarmInput.querySelector('#confirmAlarm').addEventListener(
      'click',
      (e) => {this._alarm(e);});
   timeInput.addEventListener(
      'keypress',
      (e) => {
         if (e.key == 'Enter') {
            this._timer(e);
         }
      });
   alarmInput.addEventListener(
      'keypress',
      (e) => {
         if (e.key == 'Enter') {
            this._alarm(e);
         }
      });

   selector.addEventListener('change', onselect);
   shadow.appendChild(card.content);
   //this.setAttributeNode(document.createAttribute('oncreate'));
   //this.oncreate = (obj) => {};
};

XTimerInputCardProto._timer = function (e) {
   let hrObj = this.shadowRoot.querySelector('#In1');
   let minObj = this.shadowRoot.querySelector('#In2');
   let secObj = this.shadowRoot.querySelector('#In3');
   let now = new Date;

   let hr = parseInt(hrObj.value);
   let min = parseInt(minObj.value);
   let sec = parseInt(secObj.value);

   // Blank input sanitation
   if (Number.isNaN(hr)) {
      hr  = 0;
   }
   if (Number.isNaN(min)) {
      min = 0;
   }
   if (Number.isNaN(sec)) {
      sec = 0;
   }

   let returnObj = {
      time: new Date((sec + min * 60 + hr * 3600) * 1000 + Date.now()),
      // Keeps obj type consistent with alarms
      type: 'timer',
      invalid: false,
      origin: (sec + min * 60 + hr * 3600)
   };
   if ((hr + min + sec) === 0) {
      returnObj.invalid = true;
   }

   hrObj.value = '';
   minObj.value = '';
   secObj.value = '';

   let event = new CustomEvent('timer', returnObj);
   event.time = returnObj.time;
   event.invalid = returnObj.invalid;
   event.origin = returnObj.origin;

   this.dispatchEvent(event);
};

XTimerInputCardProto._alarm = function (e) {
   let re = new RegExp(
      '(\\d\\d):(\\d\\d)' + // Base hh:mm
      '(:\\d\\d)?' // Seconds :ss
   );
   let invalid = false;
   let valueStr = this.shadowRoot.querySelector('#alarmInput').querySelector('input.time').value;
   if (!re.test(valueStr)) {
      console.warn('Invalid input: ' + valueStr);
      valueStr = '00:00:00';
      invalid = true;
   }

   let reResult = valueStr.match(re);
   let hr = parseInt(reResult[1]);
   let min = parseInt(reResult[2]);
   let sec = 0;
   if (reResult[3] !== undefined) {
      sec = parseInt(reResult[3]);
   }

   let returnObj = {
      time: sec + min * 60 + hr * 3600,
      type: 'alarm',
      invalid: false,
      origin: sec + min * 60 + hr * 3600
   };

   if (invalid) {
      returnObj.invalid = true;;
   }
   this.shadowRoot.querySelector('#alarmInput').
      querySelector('input.time').value = '';

   let event = new CustomEvent('alarm', returnObj);
   event.time = returnObj.time;
   event.invalid = returnObj.invalid;
   event.origin = returnObj.origin;

   this.dispatchEvent(event);
};

XTimerInputCardProto.test = function () {
   let events = [null,null,null,null,null,null,null,null,null,null]
   for (let i = 0; i < events.length; i++) {
      let newEvent = new CustomEvent('timer');
      newEvent.time = new Date(Date.now() + 1000 * (1 + i));
      newEvent.invalid = false;
      newEvent.origin = i + 1;
      events[i] = newEvent;
   }

   for (let event of events) {
      this.dispatchEvent(event);
   }
};

let XTimerInputCard = document.registerElement('x-TimerInputCard', {
   prototype: XTimerInputCardProto
});

// X-timerNotificationCard

let XTimerNotificationCardProto = Object.create(HTMLElement.prototype);

XTimerNotificationCardProto.createdCallback = function () {
   let shadow = this.createShadowRoot();
   let card = document.importNode(
      document.querySelector('#templateTimerNotificationCard'),
      true);
   let title = card.content.querySelector('#title');

   card.content.querySelector('#Dismiss').addEventListener('click',
                                          (e) => {this._dismissAll(e);});

   //Prevents race condition when object was made before definition
   let titletext = 'Error: title not set';
   if (this.title !== undefined && this.title !== "") {
      titletext = this.title;
   }


   this.setAttribute('title', titletext);

   Object.defineProperty(this, 'hidable', {
      value: false,
      writable: true,
      enumerable: true,
      configurable: false
   });
   //Set readonly properties
   //Bad things happen when these properties are tinkered with
   Object.defineProperty(this, 'timers', {
      value: [],
      writable: false,
      enumerable: true,
      configurable: false
   });

   title.innerText = this.title;
   this.previous = 0;
   shadow.appendChild(card.content);
};

XTimerNotificationCardProto.attributeChangedCallback = function (
   attrName, oldValue, newValue) {
   //console.log('ChangeAttr', attrName, oldValue, newValue);
   switch (attrName) {
      case 'title':
         this.shadowRoot.querySelector('#title').innerText = newValue;
         break;
      case 'hidable':
         console.warn('hidable: NotImplementedError');
      default:
         //this.
   }
};

XTimerNotificationCardProto.add = function (timerInputObj) {
   let clone = document.importNode(
      document.querySelector('#templateTimerNotificationSpan'),
      true);
   let newObj = {
      type: timerInputObj.type,
      time: timerInputObj.time,
      div: null,
      id: randint(0, MaxID)
   };

   let input = clone.content.querySelector('span.time');
   let dismiss = clone.content.querySelector('button.remove');
   let repeat = clone.content.querySelector('button.repeat');

   if (timerInputObj.type == 'alarm') {
      dismiss.innerText = 'Dismiss';
      repeat.innerText = 'Remove';
      input.innerText = this._timerToString(timerInputObj.time, timerInputObj.type);

   } else if (timerInputObj.type == 'timer') {
      dismiss.innerText = 'Dismiss';
      repeat.innerText = 'Repeat';
      input.innerText = this._timerToString(timerInputObj.origin, timerInputObj.type);
   }
   dismiss.addEventListener('click', this._makeEventClosure('_dismiss', newObj));
   repeat.addEventListener('click', this._makeEventClosure('_contextAction', newObj));

   this.timers.push(newObj);
   let card = this.shadowRoot.querySelector('#card')
   card.appendChild(clone.content);
   newObj.div = card.children[card.children.length - 1];
   return newObj.id;
};

XTimerNotificationCardProto.remove = function (id) {
   let index = this.timers.findIndex((element, index, array) => {
      if (element.id === id) {
         return true;
      }
   });

   let timer = this.timers[index];
   this.shadowRoot.querySelector('#card').removeChild(timer.div);
   this.timers.splice(index, 1);

};

XTimerNotificationCardProto._makeEventClosure = function (fStr, idObj) {
   let returnFunc = (e) => {
      this[fStr](idObj, e);
   };
   return returnFunc;
};

XTimerNotificationCardProto._dismiss = function (idObj, e) {
   let dismissEvent = new CustomEvent('dismiss');
   dismissEvent.id = idObj.id;
   dismissEvent.originType = idObj.type;
   dismissEvent.time = idObj.time;

   this.remove(idObj.id);
   this.dispatchEvent(dismissEvent);
};

XTimerNotificationCardProto._contextAction = function (idObj, e) {
   let repeatEvent;
   if (idObj.type === 'timer') {
      repeatEvent = new CustomEvent('repeat');
   } else if (idObj.type === 'alarm') {
      repeatEvent = new CustomEvent('remove');
   }
   repeatEvent.id = idObj.id;
   repeatEvent.originType = idObj.type;
   repeatEvent.time = idObj.time;
   this.remove(idObj.id);
   this.dispatchEvent(repeatEvent);
};

XTimerNotificationCardProto._dismissAll = function (e) {

   for (let i = this.timers.length; i > 0; i--) {
      let timer = this.timers[i - 1];
      this._dismiss(timer, e);
   }
};

XTimerNotificationCardProto._timerToString = function (time, type = 'timer') {

   let str = '';
   if (type === 'alarm') {
      let hr = Math.floor(time / 3600);
      let min = Math.floor(time / 60) % 60;
      let sec = time % 60;

      str = strPad(hr.toString(), 2, '0') + ':' +
            strPad(min.toString(), 2, '0');
   } else if (type === 'timer') {
      let diff = time;
      let hr = Math.floor(diff / 3600);
      let min = Math.floor(diff / 60) % 60;
      let sec = diff % 60;

      str = strPad(hr.toString(), 2, '0') + ':' +
            strPad(min.toString(), 2, '0') + ':' +
            strPad(sec.toString(), 2, '0');
   }

   return str;
};

let XTimerNotificationCard = document.registerElement('X-timerNotificationCard', {
   prototype: XTimerNotificationCardProto
});

//x-timerBody implemenation

let XTimerBodyProto = Object.create(HTMLElement.prototype);

XTimerBodyProto.createdCallback = function () {
   let shadow = this.createShadowRoot();
   let card = document.importNode(
      document.querySelector('#templateTimerBody'),
      true);

   shadow.appendChild(card.content);

   let cards = this.initCards()
   Object.defineProperty(this, 'cards', {
      value: cards,
      writable: false,
      enumerable: true,
      configurable: false
   });



   Object.defineProperty(this, 'timers', {
      value: [],
      writable: false,
      enumerable: true,
      configurable: false
   });

   Object.defineProperty(this, 'notifications', {
      value: [],
      writable: false,
      enumerable: true,
      configurable: false
   });

   // Race condition prevention

   let temp;
   if (this.saveString !== undefined) {
      temp = this.saveString;
   } else {
      temp = 'x-timer-save';
   }

   let mutableValues = [{name: 'saveString', value: 'x-timer-save'},
                        {name: 'duration', value: 5}]

   for (let defaultValue of mutableValues) {
      let temp;
      if (this[defaultValue.name] !== undefined) {
         temp = this[defaultValue.name];
      } else {
         temp = defaultValue.value;
      }

      Object.defineProperty(this, defaultValue.name, {
         value: temp,
         writable: true,
         enumerable: true,
         configurable: false,
      });
   }

   // Internal property reflection

   Object.defineProperty(this, '_vol', {
      value: .5,
      writable: true,
      enumerable: false,
      configurable: false,
   });

   Object.defineProperty(this, '_interval', {
      value: -1,
      writable: true,
      enumerable: false,
      configurable: false,
   });

   Object.defineProperty(this, '_intervalID', {
      value: -1,
      writable: true,
      enumerable: false,
      configurable: false,
   });

   this.initFunc();
   // Public 'values' (attributeChangedCallback didn't work for me)
   Object.defineProperty(this,'volume', {
      enumerable: true,
      configurable: false,
      set: this._changeVol,
      get: () => {return this._vol;}
   });

   Object.defineProperty(this, 'interval', {
      enumerable: true,
      configurable: false,
      set: this._onIntervalChange,
      get: () => {return this._interval;}
   });


   this.initTimerFunc();
   this.initNotification();
   this.interval = 1000;

   this.cards[0].addEventListener('alarm',   this.onAlarm);
   this.cards[0].addEventListener('timer',   this.onTimer);
   this.cards[1].addEventListener('remove',  this.onRemove);
   this.cards[2].addEventListener('remove',  this.onRemove);
   this.cards[3].addEventListener('dismiss', this.onDismissNotfication);
   this.cards[3].addEventListener('remove',  this.onRemoveNotfication);
   this.cards[3].addEventListener('repeat',  this.onRepeatNotfication);

};

XTimerBodyProto.attributeChangedCallback = function (attrName, oldValue, newValue) {
   console.log('BodyAttrChange', attrName, oldValue, newValue);
   switch (attrName) {
      case 'volume':
         let vol = parseFloat(newValue);
         for (let note of this.notifications) {
            note.changeVol(vol);
         }
         break;
      case 'duration':

   }
};

XTimerBodyProto.initCards = function() {
   let cards = [null, null, null, null];
   cards[0] = document.createElement('x-TimerInputCard');
   cards[1] = document.createElement('x-TimerCard');
   cards[2] = document.createElement('x-TimerCard');
   cards[3] = document.createElement('X-timerNotificationCard');
   cards[1].title = 'Alarms';
   cards[2].title = 'Timers';
   cards[3].title = 'Notifications';

   let pseudoBody = this.shadowRoot.querySelector('#pseudoBody')
   for (let i = 0;i < cards.length;i++) {
      pseudoBody.appendChild(cards[i]);
   }
   return cards;
};

XTimerBodyProto.initFunc = function () {
   // Achieves proper binding of this value
   // Because these are fired from events, they need their this value to be properly binded
   this.onAlarm = (e) => {
      if (!e.invalid) {
         let timer = new this.timerObj(e, this.cards[1]);
         this.timers.push(timer);
         this.onLeave();
      }
   };

   this.onTimer = (e) => {
      if (!e.invalid) {
         let timer = new this.timerObj(e, this.cards[2]);
         let duration = 0;
         this.timers.push(timer);
         this.onLeave();
      }
   };

   this.onRemove = (e) => {
      let index = this.timers.findIndex((element, index, array) => {
         if (element.id === e.id) {
            return true;
         }
      });

      let timer = this.timers[index];
      window.clearTimeout(timer.timerID);
      this.timers.splice(index, 1);
      this.onLeave();
   };

   this.removeNotification = (e) => {
      let index = this.notifications.findIndex((element, index, array) => {
         if (element.id === e.id) {
            return true;
         }
      });

      let notification = this.notifications[index];
      notification.audio.stop();

      notifications.splice(index, 1);
      return notification;
   }

   this.onDismissNotfication = (e) => {
      this.removeNotification(e);
      this.onLeave();
   };

   this.removeNotification = (e) => {
      let index = this.notifications.findIndex((element, index, array) => {
         if (element.id === e.id) {
            return true;
         }
      });

      let notification = this.notifications[index];
      notification.audio.stop();

      this.notifications.splice(index, 1);
      return notification;
   }

   this.onDismissNotfication = (e) => {
      this.removeNotification(e);
      this.onLeave();
   };

   this.onRemoveNotfication = (e) => {
      let notification = this.removeNotification(e);

      if (notification.timerCard !== null) {
         notification.timerCard.remove(notification.timerID);
      } else {
         console.warn('Attempted to remove notification with null timerCard')
      }

      this.onLeave();
   };

   this.onRepeatNotfication = (e) => {
      let notification = this.removeNotification(e);
      let n = notification;

      let time = n.origin;

      let date = new Date(time * 1000 + Date.now());


      let ev = {
         time: date,
         origin: n.origin,
         invalid: n.invalid,
         type: n.type
      };

      if (ev.type === 'timer') {
         this.onTimer(ev);
      } else if (ev.type === 'alarm') {
         this.onAlarm(ev);
      } else {
         this.onInvalid(ev);
      }
      this.onLeave();
   };

   this.load = () => {
      this.onLoad();
   };

   this.check = () => {
      //this.cards[1].tick();
      this.cards[2].tick();
   };


}


XTimerBodyProto.onLeave = function (e) {

   let timerRepr = [];
   let notificationRepr = [];

   for (let timer of this.timers) {
      timerRepr.push(timer.toSaveString());
   }

   if (notificationDone) {
      for (let notification of this.notifications) {
         notificationRepr.push(notification.toSaveString());
      }
   }

   let result = {
      timers: timerRepr,
      notifications: notificationRepr
   };

   let resultString = JSON.stringify(result);
   try {
      window.localStorage.setItem(this.saveString, resultString);
   } catch (e) {
      //pass
   }
};

XTimerBodyProto.onLoad = function () {
   let storageString;
   try {
      storageString = window.localStorage.getItem(this.saveString);
   } catch (e) {
      storageString = null;
   }
   if (storageString  == null) {
      storageString = '{"timers":[],"notifications":[]}';
   }


   let container = JSON.parse(storageString);
   let timers = [];
   let notifications = [];

   let timerDateReviver = (timer) => {
      if (timer.type === 'timer') {
         timer.time = new Date(timer.time);
      }

      timer.invalid = false;
   }

   for (let timerStr of container.timers) {
      let timer = JSON.parse(timerStr);
      timerDateReviver(timer);
      timers.push(timer);
   }

   for (let notification of container.notifications) {
      let note = JSON.parse(notification);
      timerDateReviver(note);
      notifications.push(note);
   }

   for (let timer of timers) {
      if (timer.type === 'timer') {
         if (timer.time < Date.now()) {
            let pseudoTimer = {
               origin: timer.origin,
               invalid: timer.invalid,
               type: timer.type,
               time: timer.time,
               timerCard: null
            };

         new this.Notification(pseudoTimer);
         } else {
            this.onTimer(timer);
         }
      } else if (timer.type === 'alarm') {
         this.onAlarm(timer);
      } else {
         console.error('Invalid timer');
      }
   }

   for (let note of notifications) {
      let pseudoAlert = {
         origin: note.origin,
         invalid: false,
         type: note.type,
         time: note.time,
         timerCard: null,
         id: undefined
      }
      new this.Notification(pseudoAlert);
   }
};

XTimerBodyProto.onAlarm = function (e) {
   if (!e.invalid) {
      let timer = new timerObj(e, this.cards[1]);
      this.timers.push(timer);
      onLeave();
   }
};

XTimerBodyProto.onTimer = function (e) {
   if (!e.invalid) {
      let timer = new timerObj(e, this.cards[2]);
      let duration = 0;
      timers.push(timer);
      onLeave();
   }
};

XTimerBodyProto.onRemove = function (e) {
   let index = this.timers.findIndex((element, index, array) => {
      if (element.id === e.id) {
         return true;
      }
   });

   let timer = this.timers[index];
   window.clearTimeout(timer.timerID);
   this.timers.splice(index, 1);
   onLeave();
};

XTimerBodyProto.onInvalid = function (e) {
   console.error('Invalid Object:', e);
}

XTimerBodyProto.removeNotification = function(e) {
   let index = this.notifications.findIndex((element, index, array) => {
      if (element.id === e.id) {
         return true;
      }
   });

   let notification = this.notifications[index];
   notification.audio.stop();

   notifications.splice(index, 1);
   return notification;
}

XTimerBodyProto.onDismissNotfication = function (e) {
   this.removeNotification(e);
   this.onLeave();
};

XTimerBodyProto.onRemoveNotfication = function (e) {
   let notification = this.removeNotification(e);

   if (notification.timerCard !== null) {
      notification.timerCard.remove(notification.timerID);
   } else {
      console.warn('Attempted to remove notification with null timerCard')
   }

   this.onLeave();
};

XTimerBodyProto.onRepeatNotfication = function (e) {
   let notification = this.removeNotification(e);
   let n = notification;

   let time = n.origin;

   let date = new Date(time * 1000 + Date.now());


   let ev = {
      time: date,
      origin: n.origin,
      invalid: n.invalid,
      type: n.type
   };

   if (ev.type === 'timer') {
      this.onTimer(ev);
   } else if (ev.type === 'alarm') {
      this.onAlarm(ev);
   } else {
      this.onInvalid(ev);
   }
   this.onLeave();
};

XTimerBodyProto._changeVol = function (vol) {
   let _vol = parseFloat(vol);
   for (let note of this.notifications) {
      note.changeVol(vol);
   }
   this._vol = _vol;
};

XTimerBodyProto._onIntervalChange = function (e) {
   clearInterval(this._intervalID);
   this._interval = e;
   this._intervalID = setInterval(this.check, e);
};

XTimerBodyProto.test = function () {
   this.cards[0].test()
}
// Object declarations

XTimerBodyProto.initTimerFunc = function () {
   let bindedThis = this;
   let makeSound = function (activeTimerObj) {
      // console.log('That: ', activeTimerObj, '\nTimers: ', timers);

      //       Entering standby defers all timeouts
      //       Make sure that the current time is close to the trigger time
      // Play sound
      const leeway = 60 * 1000;
      // 1 minute of leeway.
      // Timers are prevented from firing will sleeping,
      // and have their resoultion reduced in low power mode
      // Because of this, when waking from a sleep, all the timers that should
      // have fired during the sleep all fire at once.
      // To prevent this, we only make an audio cue on timers that fire in
      // 60 secs from their supposed time



      let index = bindedThis.timers.findIndex((element, index, array) => {
         if (element.id === activeTimerObj.id) {
            return true;
         }
      });

      let timer = bindedThis.timers[index];

      let notification = new bindedThis.Notification(timer);
      notification.audio.changeVol(bindedThis.volume);

      // sound code

      let alarmCheck = (time) => {
         let date = new Date;

         let hr = Math.floor(time / 3600);
         let min = Math.floor(time / 60) % 60;
         let sec = time % 60;

         date.setHours(hr);
         date.setMinutes(min);
         date.setSeconds(sec);
         return Date.now() - date;

      }

      let timerCheck = (time) => {
         return Date.now() - time;
      }

      let check;
      if (activeTimerObj.type === 'timer') {
         check = timerCheck(activeTimerObj.time);
      } else {
         check = alarmCheck(activeTimerObj.time)
      }

      if (Math.abs(check) < leeway) {
         notification.audio.start();
         notification.beep(parseInt(bindedThis.duration));
      } else {
         let s;
         if (activeTimerObj.type === "alarm") {
            s += "An alarm";
         } else {
            s += "A timer";
         }

         s += " failed to fire on time";
         console.log(s);
         console.warn(activeTimerObj);
      }


      if (timer.type === 'timer') {
         activeTimerObj.timerCard.remove(activeTimerObj.id, true);
         // Remove timer
         timer.timerID = 0;
         bindedThis.timers.splice(index, 1);

      } else if (timer.type === 'alarm') {
         activeTimerObj.reset();
      }

      bindedThis.onLeave();
   };

   let timerObj = function (e, timerCard) {
      this.type = e.type;
      this.time = e.time;
      this.timerID = 0;
      this.timerCard = timerCard;
      this.origin = e.origin;

      if (this.type === 'timer') {
         let diff = e.time - Date.now();
         this.timerID = window.setTimeout(makeSound, diff, this);
         //console.log(diff);
         this.id = timerCard.add(e);
      } else if (this.type === 'alarm') {
         let now = new Date;
         let nowNum = now.getHours() * 3600 +
         now.getMinutes() * 60 +
         now.getSeconds();
         const fullDay = 86400; // Seconds in a day
         let diff = this.time - nowNum;
         if (diff <= 10) {
            diff += 86400;
         }

         diff *= 1000;
         this.timerID = window.setTimeout(makeSound, diff, this);

         this.id = timerCard.add(e);
      } else {
         console.warn('err');
      }

   };

   timerObj.prototype.toString = function () {
      let result = '{';
      const endLine = ',\n';
      const lastLine = '\n';

      result += 'type: ' + this.type + endLine;

      if (this.type === 'alarm') {
         result += 'time: ' + this.time.toString() + endLine;
      } else if (this.type === 'timer') {
         result += 'time: ' + this.time.getTime().toString() + endLine;
      } else {
         result += 'time: ' + this.time.toString() + endLine;
      }

      result += 'id: ' + this.id.toString() + endLine;
      result += 'timerID: ' + this.timerID.toString() + lastLine;
      result += '}'
      return result;
   };

   timerObj.prototype.toSaveString = function () {

      return JSON.stringify(this, ['type', 'time', 'origin']);
   };

   timerObj.prototype.reset = function () {
      // Currently only works on alarms
      window.clearTimeout(this.timerID);

      if (this.type === 'alarm') {
         let now = new Date;
         let nowNum = now.getHours() * 3600 +
         now.getMinutes() * 60 +
         now.getSeconds();
         const fullDay = 86400; // Seconds in a day
         let diff = this.time - nowNum;
         if (diff <= 10) {
            diff += 86400;
         }
         diff *= 1000;
         this.timerID = window.setTimeout(makeSound, diff, this);
      } else if (this.type === 'timer') {
         console.warn('Cannot reset timers');
      } else {
         console.error('Invalid type of timerObj: ', this);
      }
   };




   XTimerBodyProto.timerObj = timerObj;
   XTimerBodyProto.makeSound = makeSound;
}

XTimerBodyProto.initNotification = function () {
   let bindedThis = this;
   class Notification {
      /*
      * property       type           comment
      * audio:         AudioObj       used to make sound via start(), stop()
      * origin:        int            Original input before processing
      * invalid:       bool           Is origin valid
      * type           str            'timer' or 'alarm'
      * timerCard      XTimerCard     XTimerCard to reference for remove
      *                               Can be null for orphans
      *                               A parent must be assigned before passing
      *                               out of XTimerNotificationCard
      * timerID        int            id to reference object for remove context
      *                               action
      * id             int            id reference from XTimerNotificationCard
      */
      constructor(timerObj) {
         /*
         *  Input:
         *  timerObj:
         *     origin
         *     invalid
         *     type
         *     time
         *     timerCard - can be null
         *     id - can be undefined if timerCard is null
         */
         this.audio = new AudioObj;
         this.origin = timerObj.origin;
         this.invalid = timerObj.invalid;
         this.type = timerObj.type;
         this.timerCard = timerObj.timerCard;
         this.time = timerObj.time;
         this.timerID = timerObj.id;

         this.id = bindedThis.cards[3].add(this);
         bindedThis.notifications.push(this);
         bindedThis.onLeave();
      }

      beep (duration) {
         let deactivate = () => {
            this.audio.stop();
         };
         setTimeout(deactivate, duration * 1000);
      }

      remove () {
         let index = notifications.findIndex((element, index, array) => {
            if (element.id === this.id) {
               return true;
            }
         });

         this.audio.stop();
         notifications.splice(index, 1);
         return this;
      }

      static removeById (id) {
         let index = bindedThis.notifications.findIndex((element, index, array) => {
            if (element.id === id) {
               return true;
            }
         });

         let notification = bindedThis.notifications[index];

         notification.audio.stop();
         bindedThis.notifications.splice(index, 1);
         return notification;
      }

      toSaveString () {
         return JSON.stringify(this,['type', 'time', 'origin']);
      }

      changeVol (vol) {
         this.audio.changeVol(vol);
      }
   }
   this.Notification = Notification;
}


let XTimerBody = document.registerElement('x-timerBody', {
    prototype: XTimerBodyProto
});

// Load stuff

window.onload = () => {
   document.querySelector('#timers').load();
   document.querySelector('#timers').duration = 30;
   document.querySelector('#timers').interval = 500;
};
