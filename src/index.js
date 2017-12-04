import React from 'react';
import { render } from 'react-dom';
import Constants from './constants';
import ReplyList from './components/ReplyList';
import ReplyListModel from './models/ReplyListModel';
import TopicList from './components/TopicList';
import TopicListModel from './models/TopicListModel';

import './style/style.css';

// TODO ignore, ignorelist, ban, ban list
// TODO sort topics by last modified -> needs access to each topic's 'last modified ' key from the topic list page
// -> this will need rewriting the topics structure
// -> validate inputs before submit : prevent nasty code injection
// TODO use topics ID hash instead of title hash as replies mutable name
// TODO make it work across tabs : localstorage ?
// TODO find a workaround for SimpleMDE 'prompt' for images, not supported in electron
// TODO better css for 'no such topic'
// TODO editable replies
// TODO better css for 'initializing topics'
// TODO donate button
// TODO CSS revamp and branding

const { DEFAULT_ID, ERROR_MSG, ANONYMOUS, FORUMNAME } = Constants;
const topicstore = new TopicListModel();
const repliestore = new ReplyListModel();

window.userId = ANONYMOUS;

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
          <TopicList store={topicstore} topic={FORUMNAME} />
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

const howlong = ( date_old )  => {

  var elapsed = "";
  var date_now =  new Date();
  var monthNames = [
  "Jan", "Feb", "Mar",
  "Apr", "May", "Jun", "Jul",
  "Aug", "Sep", "Oct",
  "Nov", "Dec"
  ];

  var day = date_old.getDate();
  var monthIndex = date_old.getMonth();
  var year = date_old.getFullYear();

  // get total seconds between the times
  var delta = Math.abs(date_old - date_now) / 1000;

  // calculate (and subtract) whole days
  var days = Math.floor(delta / 86400);
  delta -= days * 86400;

  // calculate (and subtract) whole hours
  var hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;

  // calculate (and subtract) whole minutes
  var minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  // what's left is seconds
  var seconds = delta % 60;  // in theory the modulus is not required

  if ( days > 365 ) { elapsed =  monthNames[monthIndex] + ' ' + year.slice(-2); }
  else if ( days > 30 ) { elapsed =  day + ' ' + monthNames[monthIndex] }
  else if ( days !=0 ) { elapsed = days.toString()+'d'; }
  else if ( hours !=0 ) { elapsed = hours.toString()+'h'; }
  else if ( minutes !=0 ) { elapsed = minutes.toString()+'m'; }
  else { elapsed = 'now'; }

  return elapsed;
}





window.safeTopics = renderTopics; //globally accessible
window.safeReplies = renderReplies;
window.getParameterByName = getParameterByName;
window.topicUrl = topicUrl;
window.uintToString = uintToString;
window.howlong = howlong;
