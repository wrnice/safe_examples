import React from 'react';
import { render } from 'react-dom';
import Constants from './constants';
import ReplyList from './components/ReplyList';
import ReplyListModel from './models/ReplyListModel';
import TopicList from './components/TopicList';
import TopicListModel from './models/TopicListModel';

import './style/style.css';

// TODO css, likes, ignore, ignorelist, last modified
// TODO make it work across tabs : localstorage ?
// TODO messages should be conentEditable instead of textareas
// TODO display the first 'reply' as the OP
// TODO better css for 'no such topic'

const { DEFAULT_ID, ERROR_MSG } = Constants;
const topicstore = new TopicListModel();
const repliestore = new ReplyListModel();

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function uintToString(uintArray) {
	return new TextDecoder('utf-8')
		.decode(uintArray)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

const topicUrl = ( topic, id ) => {
  return topicstring = topic.replace(/\W+/g, "-").toLowerCase()+'?i='+id;
}

const renderTopics = (id) => {
  var thetopic = getParameterByName("t", window.location.search);
  console.log ( "index.js : thetopic : ", thetopic );
  if ( !thetopic || thetopic == '' ) {
      render(
        <div>
          <TopicList store={topicstore} topic={'SafeSimpleForum4'} />
        </div>,
        document.getElementById(id),
      );
    }
    else {
      render(
        <div>
          <ReplyList store={repliestore} topic={thetopic} />
        </div>,
        document.getElementById(id),
      );
    }
};

const renderReplies = (topic,id) => {
  if (!topic) {
    alert(ERROR_MSG.TOPIC_PARAM_MISSING);
    return;
  }
  render(
    <div>
      <ReplyList store={repliestore} topic={topic} />
    </div>,
    document.getElementById(id),
  );
};





window.safeTopics = renderTopics; //globally accessible
window.safeReplies = renderReplies;
window.getParameterByName = getParameterByName;
window.topicUrl = topicUrl;
window.uintToString = uintToString;
