import React from 'react';
import { render } from 'react-dom';
import Constants from './constants';
import ReplyList from './components/ReplyList';
import ReplyListModel from './models/ReplyListModel';

import './style/style.css';

const { DEFAULT_ID, ERROR_MSG } = Constants;
const store = new ReplyListModel();

const renderApp = (topic, id) => {
  if (!topic) {
    alert(ERROR_MSG.TOPIC_PARAM_MISSING);
    return;
  }
  render(
    <div>
      <ReplyList store={store} topic={topic} />
    </div>,
    document.getElementById(id || DEFAULT_ID),
  );
};

window.safeReplies = renderApp;
