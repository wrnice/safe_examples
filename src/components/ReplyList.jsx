import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import Reply from './Reply';
import constant from '../constants.js';
import SafeApi from '../safe_api';

import SimpleMDE from 'safe-react-simplemde-editor';

@observer
class ReplyList extends React.Component {
  @observable newMessage = '';
  @observable userID = sessionStorage.getItem("userID") || constant.ANONYMOUS;
  @observable isLoading;
  @observable replyFormVisible = "hidden";
  @observable replyButtonVisible = "visible";


  componentDidMount() {
    this.props.store.authorise(this.props.topic);
    window.scrollTo(0, document.body.scrollHeight); // scroll to bottom ? did we read this already ? -> session storage ?
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

    if ( store.replies.length == 0) {
      return (
        <div>
          <div>No such Topic ! You may want to create it on : <a href = {constant.HOSTNAME} >the main forum page</a>
          </div>
        </div>
        );
    }
    else {

      var thetopic = window.getParameterByName ( "t", window.location.search );

      // <textarea
        // className="reply-msg"
        // placeholder="Enter your reply. Not more than 250 characters."
        // name="message"
        // maxLength="250"
        // value={this.newMessage}
        // required="required"
        // onChange={this.handleInputChange}
      // />



    return (
      <div className="main">

        <header>
        <div style={{height: 48 +'px'}}>
          <img src="images/favicon.ico"  ></img>
          <a id="mainmenu" className="menu" title="Main Menu" href={constant.HOSTNAME} >Safe Simple Forum
          </a>
          <div className="loggedas">
            <label htmlFor="userId">logged as </label>
            <select id="userID" name="userID" onChange ={ this.setUserId } value={this.userID}>
              {userList.map((userList, i) => <option key={i} value={userList}>{userList}</option>)}
              <option value={constant.ANONYMOUS} >{constant.ANONYMOUS}</option>
            </select>

          </div>
        </div>
       </header>

        <div className="messages">

          <div className="title">{thetopic}</div>

          {/* <div className="replies-count">{store.replies.length} Reply(s)</div> */}
          <ul className="replylist">
            {store.replies.map(reply => (
              <Reply reply={reply} isOwner={store.isOwner} deleteReply={store.deleteReply} key={reply.id} />
            ))}
          </ul>
        </div>

        <button id="replybutton" className={"newreply"} onClick={this.replyButtonPressed} style={{visibility: this.replyButtonVisible }}>reply</button>

        <div id="newReplyForm" className="footerform" style={{visibility: this.replyFormVisible }}>

              <SimpleMDE
                className="reply-msg"
                placeholder="Enter your reply here..."
                name="message"
                onChange={this.handleChange}
                value={this.newMessage}
                required="required"
                  options={{
                    autoDownloadFontAwesome:false,
                    spellChecker: false,
                    hideIcons: ["guide","side-by-side","fullscreen"],
                    promptURLs:false
                                      }}
                  />

          <div className="formbuttons">
          <button className="cancel" onClick={this.cancelButtonPressed} >cancel</button>
          <button className="sendbutton" onClick={this.handleFormSubmit} >Reply</button>


          </div>


        </div>
        {isLoading}
        {this.getNetworkComponent()}
      </div>
    );
  }
}

  @action
  handleChange = (value) => {
    this.newMessage = value;
  };

  @action
  handleFormSubmit = (e) => {
    e.preventDefault();

    console.log ( 'submit Button Pressed');

    console.log ( 'message : ', this.newMessage );

    var userId = document.getElementById('userID').value;

    const store = this.props.store;
    if (userId === '' || this.newMessage === '') {
      window.alert('Please select your ID and enter reply');
      return;
    }
    var thetopic = window.getParameterByName ( "t", window.location.search );

    store.addReply(thetopic,userId, this.newMessage);
    this.newMessage = '';
    this.replyFormVisible = "hidden";
    this.replyButtonVisible = "visible";
  };

  @action
  replyButtonPressed = (e) => {
    console.log ( 'replyButtonPressed');
    if ( this.replyFormVisible == "visible" ) {
       this.replyFormVisible = "hidden";
       this.replyButtonVisible = "visible";
     } else {
       this.replyFormVisible = "visible";
       this.replyButtonVisible = "hidden";
     }
  };

  @action
  cancelButtonPressed = (e) => {
    console.log ( 'cancelButtonPressed');
    this.newMessage = '';
    this.replyFormVisible = "hidden";
    this.replyButtonVisible = "visible";
  };

  @action
  setUserId = (e) => {
    var id = e.target.value;
    console.log ( 'setUserId : id : ', id ); //debug
    sessionStorage.setItem('userID', id);
    this.userID= id  ;
  };



}


export default ReplyList;
