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
  // either :/
  //  store the last_modified date in the replies mutable : each topic has a topic.last_modified key
  //  store the last_modified date in the topics mutable : insert a last_modified field in the json --> this would allow to use topic.last_modified

  render() {
    const { topic, isOwner } = this.props;
    const deleteLink = isOwner ? this.getDeleteLink() : null;
    this.api = new SafeApi();
    const lastmod = this.api.getLastMod(topic.title).then ( function (result ) {
        var lastmod = result +"";
        document.getElementById("lastmod"+topic.id).innerHTML=new Date(lastmod).toLocaleString();
      });

    return (

      <div className="topics">
        <a href = {constant.HOSTNAME+"?t="+topic.title}  >
          <div className="topiclink">{topic.title}</div>
        </a>

        <div className="topicdescr">
          Published
            <span className="date">{' '+new Date(topic.date).toLocaleString()+' '}</span>
            by
            <span className="user">{' '+topic.author+' '}</span>

        </div>

        <div  className="lastmod">
          last modified :
             <span id={"lastmod"+topic.id} className="date"></span>
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
    likes: PropTypes.array.isRequired,
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  deleteTopic: PropTypes.func.isRequired,
};

export default Topic;
