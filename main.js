"use strict";

function createElement(html) {
  const root = document.createElement("div");
  root.insertAdjacentHTML("beforeend", html);
  return root.firstElementChild;
}

// как мы достали из класса внешнюю функцию createElement

class AlertList {
  _element = null;
  _subElements = {};
  _alertQueue = [];
  constructor(selector, maxNumber) {
    this._parent = document.querySelector(selector);
    this._maxNumber = maxNumber;
    this.init();
  }
  init() {
    this._element = createElement(this._getTemplate());
    this._subElements = this._getSubElements();
    this.render();
  }

  render() {
    this._subElements.menuWrapper.insertAdjacentElement("beforeend", this._getTemplate());
  }

  _getTemplate() {
    return `
		    <div class="alert__menu" data-element='menuWrapper'>
      		<div class="alert__control control">
        		<div class="control__circle" data-element='numberAlerts'>9</div>
        		<button class="control__btn" data-element='btnHide'>Скрыть всё</button>
      		</div>
    		</div>
		`;
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

const alertList = new AlertList({
  selector: "body",
  maxNumber: 3,
});

class Alert {
  _root = null;
  closeBtn = null;
  _timerId;
  constructor({ type, timer, title, text }) {
    this.type = type;
    this.timer = timer;
    this.title = title;
    this.text = text;
    this._init();
  }

  _init() {
    this._root = createElement(this._getTemplate());
    this.closeBtn = this._root.querySelector('[data-btn="close"]');
    this.listener();
  }
  listener() {
    this.closeBtn.addEventListener("click", () => {
      this.destroy();
    });
  }
  _getTemplate() {
    return `
		<div class="alert__body notification--${this.type}">
      <div class="notification__timer" ></div>
      <div class="notification__info">
        <div class="notification__title">${this.title}</div>
        <div class="notification__text">${this.text}</div>
        <button class="notification__close" data-btn="close">x</button>
			</div>
    </div>
		`;
  }

  createTimer() {
    const timerId = this._timerId;
    timerId = setTimeout(() => {
      this.add();
    }, this.time);
  }

  add() {
    // -
    return this.parent.insertAdjacentElement("beforeend", this._root);
  }

  remove() {
    return this._root.remove();
  }

  destroy() {
    clearTimeout(this._timerId);
    return this.remove();
  }
}

const success = new Alert({
  type: "success",
  title: "Успех!",
  text: "Вы выиграли 1000000!",
  timer: 5000,
});

const error = new Alert({
  type: "error",
  title: "Ошибка!",
  text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo vitae vero voluptas adipisci est perspiciatis excepturi.",
  timer: 3000,
});

document.querySelector(".alert__btn--success").addEventListener("click", () => {
  return success.add();
});

document.querySelector(".alert__btn--error").addEventListener("click", () => {
  return error.add();
});
