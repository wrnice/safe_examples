import React, { Component } from 'react';
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
    console.log ( 'reply : ', howmanylikes );

    return (

      <div className="reply">
      <div className="topicdescr">
         <span className="user">{' '+reply.name+' :'}</span>
          <span className="replydate">{' '+new Date(reply.date).toLocaleString()+' '}</span>
      </div>

      <div className="message">{reply.message}</div>
        <div className="replybuttons">
        <div className="likes"><span id={reply.id}></span> likes {'\u2665'}</div>
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
