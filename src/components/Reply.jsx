import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

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
    return (

      <div className="reply">
      <div className="topicdescr">
         <span className="user">{' '+reply.name+' :'}</span>
          <span className="replydate">{' '+new Date(reply.date).toLocaleString()+' '}</span>
      </div>

      <div className="message">{reply.message}</div>

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
