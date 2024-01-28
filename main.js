"use strict";

function createElement(html) {
  const root = document.createElement("div");
  root.insertAdjacentHTML("beforeend", html);
  return root.firstElementChild;
}

class BasicComponents {
  _element = null;
  _subElements = {};

  _init() {
    this._element = createElement(this._getTemplate());
    this._subElements = this._getSubElements();
  }

  get element() {
    return this._element;
  }

  _getSubElements() {
    return Array.from(this._element.querySelectorAll("[data-element]")).reduce((acc, el) => {
      return {
        ...acc,
        [el.getAttribute("data-element")]: el,
      };
    }, {});
  }
}

class AlertList extends BasicComponents {
  _alertQueue = [];
  _alertNumber = 0;

  constructor({ maxNumber }, Alert) {
    super();
    this._maxNumber = maxNumber;
    this._Alert = Alert;
    this._init();
  }

  _init() {
    super._init();
    this._addListeners();
  }

  _addListeners() {
    this._subElements.btnHide.addEventListener("click", () => {
      this._alertQueue.forEach((alert) => {
        alert.destroy();
        this._remove(alert);
      });
    });
  }

  _reRender() {
    this._subElements.numberAlerts.textContent = `+${this._alertNumber - this._maxNumber}`;

    if (this._alertNumber > this._maxNumber) {
      this._subElements.control.classList.add("control--active");
      this._subElements.list.style.height = `${
        5 * this._maxNumber +
        this._alertQueue.slice(0, this._maxNumber).reduce((acc, el) => {
          acc + el.getSize().height, 0;
        })
      }px`;
    } else {
      this._subElements.control.classList.remove("control--active");
      this._subElements.list.style.height = "auto";
    }
  }

  addAlert(alert) {
    this._alertNumber = this._alertQueue.push(alert);
    this._subElements.list.insertAdjacentElement("afterbegin", alert.render(this._remove.bind(this)));
    this._reRender();
  }

  _remove(context) {
    this._alertQueue = this._alertQueue.filter((alert) => context !== alert);
    this._alertNumber -= 1;
    this._reRender();
  }

  _getTemplate() {
    return `
		    <div class="alert__menu" data-element='menuWrapper'>
      		<div class="alert__control control" data-element='control'>
        		<div class="control__circle" data-element='numberAlerts'></div>
        		<button class="control__btn" data-element='btnHide'>Скрыть всё</button>
      		</div>
					<div class="alert__list"  data-element='list'></div>
    		</div>
		`;
  }
}

class Alert extends BasicComponents {
  _timerId;
  _callback;

  constructor({ type, time, title, text }) {
    super();
    this._type = type;
    this._time = time;
    this._title = title;
    this._text = text;
    this._init();
  }

  _init() {
    super._init();
    this._addListeners();
  }

  _addListeners() {
    this._subElements.close.addEventListener("click", () => {
      this._callback(this);
      this.destroy();
    });
  }

  render(callback) {
    this._callback = callback;
    this._createTimer();
    return this._element;
  }

  _createTimer() {
    this._timerId = setTimeout(() => {
      this._remove();
      this._callback(this);
    }, this._time);
  }

  getSize() {
    return {
      height: this._element.getBoundingClientRect().height,
      width: this._element.getBoundingClientRect().width,
    };
  }

  _remove() {
    return this._element.remove();
  }

  destroy() {
    clearTimeout(this._timerId);
    return this._remove();
  }

  _getTemplate() {
    return `
		<div class="alert__body notification--${this._type}">
      <div class="notification__timer" style="animation-duration:${this.time / 1000}s"></div>
      <div class="notification__info">
        <div class="notification__title">${this._title}</div>
        <div class="notification__text">${this._text}</div>
        <button class="notification__close" data-element="close">x</button>
			</div>
    </div>
		`;
  }
}

const root = document.querySelector(".root");
const alertList = new AlertList({
  maxNumber: 3,
});

root.append(alertList.element);

root.querySelector(".alert__btn--success").addEventListener("click", () => {
  return alertList.addAlert(
    new Alert({
      type: "success",
      title: "Успех!",
      text: "Вы выиграли 1000000!",
      time: 5000,
    })
  );
});

root.querySelector(".alert__btn--error").addEventListener("click", () => {
  return alertList.addAlert(
    new Alert({
      type: "error",
      title: "Ошибка",
      text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo vitae vero voluptas adipisci est perspiciatis excepturi.",
      time: 3000,
    })
  );
});
