/**
 * A UI Element
 *
 * @typedef {ReactElement|HTMLElement} DialogContent
 */

/**
 * UI Dialog
 *
 * @typedef {Object} DialogProps
 * @property {string} id -
 * @property {DialogContent} content -
 * @property {Function} onSubmit -
 * @property {Function} onClose -
 */

const uiDialogServicePublicAPI = {
  name: 'UIDialogService',
  dismiss,
  dismissAll,
  create,
  setServiceImplementation,
};

const uiDialogServiceImplementation = {
  _dismiss: () => console.warn('dismiss() NOT IMPLEMENTED'),
  _dismissAll: () => console.warn('dismissAll() NOT IMPLEMENTED'),
  _create: () => console.warn('create() NOT IMPLEMENTED'),
};

function createUIDialogService() {
  return uiDialogServicePublicAPI;
}

/**
 * Show a new UI dialog;
 *
 * @param {DialogProps} props { id, content, onSubmit, onClose }
 */
function create({ id, content, onSubmit, onClose }) {
  return uiDialogServiceImplementation._create({
    id,
    content,
    onSubmit,
    onClose,
  });
}

/**
 * Destroys all dialogs, if any
 *
 * @returns void
 */
function dismissAll() {
  return uiDialogServiceImplementation._dismissAll();
}

/**
 * Destroy the dialog, if currently created
 *
 * @returns void
 */
function dismiss({ id }) {
  return uiDialogServiceImplementation._dismiss({ id });
}

/**
 *
 *
 * @param {*} {
 *   dismiss: dismissImplementation,
 *   dismissAll: dismissAllImplementation,
 *   create: createImplementation,
 * }
 */
function setServiceImplementation({
  dismiss: dismissImplementation,
  dismissAll: dismissAllImplementation,
  create: createImplementation,
}) {
  if (dismissImplementation) {
    uiDialogServiceImplementation._dismiss = dismissImplementation;
  }
  if (dismissAllImplementation) {
    uiDialogServiceImplementation._dismissAll = dismissAllImplementation;
  }
  if (createImplementation) {
    uiDialogServiceImplementation._create = createImplementation;
  }
}

export default createUIDialogService;
