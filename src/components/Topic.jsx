import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

@observer
class Topic extends Component {
  getDeleteLink() {
    const { topic, deleteTopic } = this.props;
    return (
      <div className="_opt">
        <button
          className="deleteReply"
          onClick={() => { deleteTopic(topic); }}
        >Delete
        </button>
      </div>
    );
  }

  // TODO last modified : time elapsed since last reply
  // -> get last reply in the corresponding mutable, compare its date to the current date, express in minutes / hours / days / monthes / years

  render() {
    const { topic, isOwner } = this.props;
    const deleteLink = isOwner ? this.getDeleteLink() : null;
    return (

      <div className="topics">
        <a href = {"localhost://p:3008?t="+topic.title}  >
          <div className="topiclink">{topic.title}</div>
        </a>

        <div className="topicdescr">
          Published
            <span className="date">{' '+new Date(topic.date).toLocaleString()+' '}</span>
            by
            <span className="user">{' '+topic.author+' '}</span>

        </div>



        <div className="_opts">
          {deleteLink}
        </div>



      </div>

    );
  }
}

Topic.propTypes = {
  topic: PropTypes.shape({
    author: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  deleteTopic: PropTypes.func.isRequired,
};

export default Topic;
