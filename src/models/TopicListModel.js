import { observable, action } from 'mobx';
import SafeApi from '../safe_api';
import CONSTANTS from '../constants';

import TopicModel from './TopicModel';

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
      const date1 = new Date(a.last_modified);
      const date2 = new Date(b.last_modified);
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
  authorise = async (forum) => {
    try {
      this.isAuthorising = true;
      this.api = new SafeApi(forum, this.nwStateCb);
      await this.api.authorise(forum);
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
      alert(`Failed to initialise: ${err}`);
    }
  }

  @action
  addTopic = async (author, text) => {
    try {
      this.isLoading = true;
      const date = new Date().toUTCString();
      const topics = await this.api.postTopic(new TopicModel(author, text, date, date));
      this.topics = this.sortTopics(topics);
      this.isLoading = false;
    } catch (err) {
      console.error('addTopic: ', err);
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
