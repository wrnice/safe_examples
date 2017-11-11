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

  render() {
    const { topic, isOwner } = this.props;
    const deleteLink = isOwner ? this.getDeleteLink() : null;
    return (
      <li className="reply-ls-i">
        <div className="_title">
            <span className="_user">{topic.author}</span>
            <span className="_date">{new Date(topic.date).toLocaleString()}</span>
        </div>

        <a href = {"localhost://p:3008?t="+topic.title}  >
          <div className="_message">{topic.title}</div>
        </a>

        <div className="_opts">
          {deleteLink}
        </div>

      </li>
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
