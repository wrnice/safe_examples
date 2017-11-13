import { observable, action } from 'mobx';
import SafeApi from '../safe_api';
import CONSTANTS from '../constants';

import TopicModel from './TopicModel';
import ReplyModel from './ReplyModel';

export default class TopicListModel {
  @observable topics = [];

  @observable isLoading = false;

  @observable publicNames = [];

  @observable isAuthorising = false;

  @observable isEnabled = false;

  @observable isOwner = false;

  @observable isNwConnected = true;

  @observable isNwConnecting = false;

  sortTopics(topics) {
    topics.sort((a, b) => {
      // const date1 = new Date(a.last_modified);
      // const date2 = new Date(b.last_modified);
      const date1 = new Date(a.date);
      const date2 = new Date(b.date);
      if (date1 > date2) return -1;
      if (date1 < date2) return 1;
      return 0;
    });
    return topics;
  }

  @action
  nwStateCb = (newState) => {
    console.log('@model Network state changed to: ', newState);
    if (newState === CONSTANTS.NET_STATE.CONNECTED) {
      this.isNwConnected = true;
      return;
    }
    this.isNwConnected = false;
  }

  @action
  authorise = async (topic) => {
    try {
      this.isAuthorising = true;
      this.api = new SafeApi(topic, this.nwStateCb);
      await this.api.authorise();
      const topics = await this.api.listTopics();
      this.topics = this.sortTopics(topics);
      const publicIDList = await this.api.getPublicNames();
      this.publicNames = publicIDList;
      this.isOwner = await this.api.isOwner();
      this.isAuthorising = false;
      this.isEnabled = true;
    } catch (err) {
      if (err.message && err.message === CONSTANTS.ERROR_MSG.PUBLIC_ID_DOES_NOT_MATCH) {
        this.isAuthorising = false;
        this.isEnabled = false;
        return;
      }
      alert(`Failed to initialise ! : ${err}`);
    }
  }

  @action
  addTopic = async (author, title, text ) => {
    try {
      this.isLoading = true;
      const date = new Date().toUTCString();
      // const topics = await this.api.postTopic(new TopicModel(title, author, op, date_created, last_modified ));
      const topics = await this.api.publishTopic(new TopicModel(author, title, date ));

      // create a new mutable for the replies to this topic
      const newreply = await this.api.setupReplies(title);
      // , and put the original post as a fisrt reply
      const replies = await this.api.postReply(title,new ReplyModel(author, text, date ));

      this.topics = this.sortTopics(topics);
      this.isLoading = false;
    } catch (err) {
      console.error('addTopic: ', err);
      // TODO check if data already exist, pop an alert.
      this.isLoading = false;
    }
  }

  @action
  deleteTopic = async (topic) => {
    try {
      this.isLoading = true;
      const topics = await this.api.deleteTopic(topic);
      this.topics = this.sortTopics(topic);
      this.isLoading = false;
    } catch (err) {
      console.error('deleteTopic: ', err);
      this.isLoading = false;
    }
  }

  @action
  reconnect = async () => {
    try {
      this.isNwConnecting = true;
      await this.api.reconnect();
      this.isNwConnecting = false;
      this.isNwConnected = true;
    } catch (err) {
      console.error('reconnect error :: ', err);
      this.isNwConnected = false;
    }
  }
}
