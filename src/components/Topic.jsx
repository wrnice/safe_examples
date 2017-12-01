import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import constant from '../constants.js';
import SafeApi from '../safe_api';

@observer
class Topic extends Component {
  getDeleteLink() {
    const { topic, deleteTopic } = this.props;
    return (
      <div >
        <button
          className="deleteReply"
          onClick={() => { deleteTopic(topic); }}
        >Delete
        </button>
      </div>
    );
  }

    componentDidMount() {

      const { topic } = this.props;
      const lastmod = topic.lastmod;
      var elapsed = howlong ( new Date( lastmod));
      document.getElementById("lastmod"+topic.id).innerHTML=' ' +elapsed;

    }

  render() {
    const { topic, isOwner } = this.props;
    const deleteLink = isOwner ? this.getDeleteLink() : null;
    this.api = new SafeApi();

    return (

      <div className="topics">
        <a href = {constant.HOSTNAME+"?t="+topic.title}  >
          <div className="topiclink">{topic.title}</div>
        </a>

        <div  className="lastmod">
             <span id={"lastmod"+topic.id} className="date"></span>
        </div>

        <div className="repliescount">{topic.repliescount}</div>

        <div className="topicdescr">
          Published
            <span className="date">{' '+new Date(topic.date).toLocaleString()+' '}</span>
            by
            <span className="user">{' '+topic.author+' '}</span>
              <span className="_opts">
                {deleteLink}
              </span>
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
    likes: PropTypes.array.isRequired,
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  deleteTopic: PropTypes.func.isRequired,
};

export default Topic;
