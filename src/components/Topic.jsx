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
          className="deleteTopic"
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
      <li className="topic-ls-i">
        <div className="_title">
          <span className="_user">{topic.title}</span>
          <span className="_user">{topic.author}</span>
          <span className="_date">{new Date(topic.date_created).toLocaleString()}</span>
          <span className="_date">{new Date(topic.last_modified).toLocaleString()}</span>
        </div>
        <div className="_opts">
          {deleteLink}
        </div>
      </li>
    );
  }
}

Topic.propTypes = {
  topic: PropTypes.shape({
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  deleteTopic: PropTypes.func.isRequired,
};

export default Topic;
