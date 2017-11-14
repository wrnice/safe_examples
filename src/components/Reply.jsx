import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

import SafeApi from '../safe_api';
import CONSTANTS from '../constants';

@observer
class Reply extends Component {
  getDeleteLink() {
    const { reply, deleteReply } = this.props;
    return (
      <div className="_opt">
        <button
          className="deleteReply"
          onClick={() => { deleteReply(reply); }}
        >Delete
        </button>
      </div>
    );
  }

  componentDidMount() {
    var heart = '\u2665';
    document.getElementById('heart').innerHTML=heart;
  }

  @action
  heartButtonPressed = (e) => {
    console.log ( 'heartButtonPressed');
    // check if we are not anonymous , then if we already liked this reply
    //
    // this.api.getPublicNames , parse result for a pair of : our ID, the reply ID
    //
    // add  1 like in the mutable : our ID, the reply ID
    // turn heart color red
    //document.getElementById('heart').style.color="#fa6c8d";

  };

  render() {
    const { reply, isOwner } = this.props;
    const deleteLink = isOwner ? this.getDeleteLink() : null;

    var thetopic = window.getParameterByName ( "t", window.location.search );

    this.api = new SafeApi();

    var getlikes = this.api.getlikes(thetopic,reply.id).then( function(result)  {
      var likes = result +"";
      console.log ( 'reply : ', likes );
      document.getElementById(reply.id).innerHTML=likes;
    });

    var howmanylikes = getlikes;

    return (

      <div className="reply">
      <div className="topicdescr">
         <span className="user">{' '+reply.name+' :'}</span>
          <span className="replydate">{' '+new Date(reply.date).toLocaleString()+' '}</span>
      </div>

      <div className="message">{reply.message}</div>
        <div className="replybuttons">
          <div className="likes">
            <span id={reply.id}></span> likes <span id="heart" className ="heart" onClick={this.heartButtonPressed} title="soon!"></span>

          </div>
        </div>
        <div className="_opts">
          {deleteLink}
        </div>

      </div>

    );
  }
}

Reply.propTypes = {
  reply: PropTypes.shape({
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  deleteReply: PropTypes.func.isRequired,
};



export default Reply;
