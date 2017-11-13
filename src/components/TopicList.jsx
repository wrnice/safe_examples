import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import Topic from './Topic';
import constant from '../constants.js';


// TODO topic message should be html


@observer
class TopicList extends React.Component {
  @observable newText = '';
  @observable newTitle = '';
  @observable isLoading;
  @observable topicFormVisible ="hidden";
  @observable newTopicButtonVisible = "visible";

  componentDidMount() {
    this.props.store.authorise(this.props.topic);
    window.scrollTo(0, document.body.scrollHeight);
    this.setState(
      {

        isLoading: false,
      });
  }

  getNetworkComponent() {
    const { isNwConnected, isNwConnecting, reconnect } = this.props.store;
    if (isNwConnected) {
      return null;
    }

    const diconnected = (
      <div className="_nwState-b">
        <h3>Network Disconnected</h3>
        <div className="_opt">
          <button name="reconnect" onClick={() => {reconnect()}}>Reconnect</button>
        </div>
      </div>
    );

    const connecting = (
      <div className="_nwState-b connecting" >
        <h3>Network Connecting</h3>
      </div>
    );

    return (
      <div className="_nwState">
        { isNwConnecting ? connecting : diconnected }
      </div>
    )
  }

  getAuthorisingContainer() {
    return (
      <div className="_replies_init">Initialising topics. Please wait...</div>
    );
  }

  getNotEnabledContainer() {
    return (
      <div className="_replies_init">Sorry forum not enabled.</div>
    );
  }

  render() {
    const store = this.props.store;
    const userList = store.publicNames;
    if (store.isAuthorising) {
      return this.getAuthorisingContainer();
    }

    if (!store.isEnabled) {
      return this.getNotEnabledContainer();
    }

    const isLoading = store.isLoading ? (<div className="_topics-loading"><div className="loader-1">{''}</div></div>) : null;

    // if pushed 'reply' button, topic form should be visible,
    // else, it should not be rendered

    return (
      <div className="main">

        <header>
        <div style={{height: 48 +'px'}}>
          <img src="images/favicon.ico"  ></img>
          <a id="mainmenu" className="menu" title="Main Menu" href={constant.HOSTNAME} >Safe Simple Forum
          </a>
          <span id="createtopic" className={"newtopic"} onClick={this.newTopicButtonPressed} style={{visibility: this.newTopicButtonVisible }}>new topic</span>
        </div>
       </header>

        <div className="messages" >
          <div className="replies-count">{store.topics.length} Topic(s)</div>
          <ul className="topiclist">
            {store.topics.map(topic => (
              <Topic topic={topic} isOwner={store.isOwner} deleteTopic={store.deleteTopic} key={topic.id} />
            ))}
          </ul>
        </div>
        <div id="newTopicForm" className={"footerform"} style={{visibility: this.topicFormVisible }}>
          <form onSubmit={this.handleFormSubmit}>
            <div className="reply-users">
              <label htmlFor="replyUser">Publish as </label>
              <select name="replyUser" ref={(c) => { this.author = c; }}>
                {userList.map((userList, i) => <option key={i} value={userList}>{userList}</option>)}
                <option value={constant.ANONYMOUS} >{constant.ANONYMOUS}</option>
              </select>
            </div>
            <textarea
              className="reply-title"
              placeholder="Topic title"
              name="topic_title"
              maxLength="50"
              value={this.newTitle}
              required="required"
              onChange={this.handleTitleInputChange}
            />
            <textarea
              className="reply-msg"
              placeholder="Type your message here"
              name="topic_text"
              maxLength="50"
              value={this.newText}
              required="required"
              onChange={this.handleTextInputChange}
            />
          <div className="formbuttons">
          <button className="cancel" onClick={this.cancelButtonPressed} >cancel</button>
          <button className="sendbutton" type="submit" disabled={this.newTitle.length === 0}>Publish</button>
          </div>

          </form>
        </div>

        {isLoading}
        {this.getNetworkComponent()}
      </div>
    );
  }

  @action
  handleTitleInputChange = (e) => {
    this.newTitle = e.target.value;
  };

  @action
  handleTextInputChange = (e) => {
    this.newText = e.target.value;
  };

  @action
  handleFormSubmit = (e) => {
    e.preventDefault();

    const store = this.props.store;
    if (this.author.value === '' || this.newTitle === '' || this.newText === '') {
      window.alert('Please select your ID, and enter your topic title and text');
      return;
    }
    store.addTopic(this.author.value, this.newTitle, this.newText );
    this.newTitle = '';
    this.newText = '';
    this.topicFormVisible = "hidden";
    this.newTopicButtonVisible = "visible";
  };

@action
newTopicButtonPressed = (e) => {
  console.log ( 'newTopicButtonPressed');
  if ( this.topicFormVisible == "visible" ) {
     this.topicFormVisible = "hidden";
     this.newTopicButtonVisible = "visible";
   } else {
     this.topicFormVisible = "visible";
     this.newTopicButtonVisible = "hidden";
   }
};

@action
cancelButtonPressed = (e) => {
  console.log ( 'cancelButtonPressed');
  this.newTitle = '';
  this.newText = '';
  this.topicFormVisible = "hidden";
  this.newTopicButtonVisible = "visible";
};


}
export default TopicList;
