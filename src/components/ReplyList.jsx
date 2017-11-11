import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import Reply from './Reply';
import constant from '../constants.js';

@observer
class ReplyList extends React.Component {
  @observable newMessage = '';
  @observable isLoading

  componentDidMount() {
    //this.props.store.authorise(this.props.topic);
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
      <div className="_replies_init">Initialising replies for this topic. Please wait...</div>
    );
  }

  getNotEnabledContainer() {
    return (
      <div className="_replies_init">Sorry replies not enabled for this topic.</div>
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

    const isLoading = store.isLoading ? (<div className="_replies-loading"><div className="loader-1">{''}</div></div>) : null;

    return (
      <div className="_replies">
        <div className="_reply-box">
          <form onSubmit={this.handleFormSubmit}>
            <div className="_reply-users">
              <label htmlFor="replyUser">Reply as</label>
              <select name="replyUser" ref={(c) => { this.name = c; }}>
                {userList.map((userList, i) => <option key={i} value={userList}>{userList}</option>)}
                <option value={constant.ANONYMOUS} >{constant.ANONYMOUS}</option>
              </select>
            </div>
            <textarea
              className="_reply-msg"
              placeholder="Enter your reply. Not more than 250 characters."
              name="message"
              maxLength="250"
              value={this.newMessage}
              required="required"
              onChange={this.handleInputChange}
            />
            <button className="_reply-post-btn" type="submit" disabled={this.newMessage.length === 0}>Reply</button>
          </form>
        </div>
        <div className="_reply-list">
          <div className="_replies-count">{store.replies.length} Reply(s)</div>
          <ul className="_reply-ls">
            {store.replies.map(reply => (
              <Reply reply={reply} isOwner={store.isOwner} deleteReply={store.deleteReply} key={reply.id} />
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
    this.newMessage = e.target.value;
  };

  @action
  handleFormSubmit = (e) => {
    e.preventDefault();

    const store = this.props.store;
    if (this.name.value === '' || this.newMessage === '') {
      window.alert('Please select your ID and enter reply');
      return;
    }
    var thetopic = getParameterByName ( "t", window.location.search );
    store.addReply(thetopic,this.name.value, this.newMessage);
    this.newMessage = '';
  };
}

export default ReplyList;
