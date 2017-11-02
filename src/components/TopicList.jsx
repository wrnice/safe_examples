import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import Topic from './Topic';
import constant from '../constants.js';

@observer
class TopicList extends React.Component {
  @observable newText = '';
  @observable isLoading

  componentDidMount() {
    this.props.store.authorise(this.props.topic);
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

    return (
      <div className="_topics">
        <div className="_topic-box">
          <form onSubmit={this.handleFormSubmit}>
            <div className="_reply-users">
              <label htmlFor="replyUser">Publish as</label>
              <select name="replyUser" ref={(c) => { this.name = c; }}>
                {userList.map((userList, i) => <option key={i} value={userList}>{userList}</option>)}
                <option value={constant.ANONYMOUS} >{constant.ANONYMOUS}</option>
              </select>
            </div>
            <textarea
              className="_topic-msg"
              placeholder="Enter your text. Not more than 250 characters."
              name="topic_text"
              maxLength="250"
              value={this.newText}
              required="required"
              onChange={this.handleInputChange}
            />
          <button className="_new-topic-btn" type="submit" disabled={this.newtopic.length === 0}>Publish</button>
          </form>
        </div>
        <div className="_topic-list">
          <div className="_topics-count">{store.topics.length} Topic(s)</div>
          <ul className="_topic-ls">
            {store.topics.map(topic => (
              <Topic topic={topic} isOwner={store.isOwner} deleteTopic={store.deleteTopic} key={reply.id} />
            ))}
          </ul>
        </div>
        {isLoading}
        {this.getNetworkComponent()}
      </div>
    );
  }

  @action
  handleInputChange = (e) => {
    this.newText = e.target.value;
  };

  @action
  handleFormSubmit = (e) => {
    e.preventDefault();

    const store = this.props.store;
    if (this.name.value === '' || this.newText === '') {
      window.alert('Please select your ID and enter your text');
      return;
    }
    store.addTopic(this.name.value, this.newText);
    this.newText = '';
  };
}

export default TopicList;
