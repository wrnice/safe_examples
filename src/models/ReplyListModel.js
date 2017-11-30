import { observable, action } from 'mobx';
import SafeApi from '../safe_api';
import CONSTANTS from '../constants';

import ReplyModel from './ReplyModel';

export default class ReplyListModel {
  @observable replies = [];

  @observable isLoading = false;

  @observable publicNames = [];

  @observable isAuthorising = false;

  @observable isEnabled = false;

  @observable isOwner = false;

  @observable isNwConnected = true;

  @observable isNwConnecting = false;

  sortReplies(replies) {
    replies.sort((a, b) => {
      const date1 = new Date(a.date);
      const date2 = new Date(b.date);
      if (date1 < date2) return -1;
      if (date1 > date2) return 1;
      return 0;
    });
    return replies;
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
  authorise = async (reply) => {
    try {


      this.isAuthorising = true;
      this.api = new SafeApi(reply, this.nwStateCb);
      //await this.api.authorise();  //*******************************************
      const replies = await this.api.listReplies(reply); //*******************************************
      this.replies = this.sortReplies(replies); //*******************************************
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
  addReply = async (topic, name, message) => {
    try {


      this.isLoading = true;
      const date = new Date().toUTCString();
      const replies = await this.api.postReply(topic ,new ReplyModel(name, message, date));
      const updatelastmod = await this.api.updateLastMod ( topic , date );

      this.replies = this.sortReplies(replies);
      this.isLoading = false;
    } catch (err) {
      console.error('addReply: ', err);
      this.isLoading = false;
    }
  }

  @action
  deleteReply = async (reply) => {
    try {
      this.isLoading = true;
      const date = new Date().toUTCString();
      const replies = await this.api.deleteReply(reply);
      const updatelastmod = await this.api.updateLastMod ( topic , date );
      this.replies = this.sortReplies(reply);
      this.isLoading = false;
    } catch (err) {
      console.error('deleteReply: ', err);
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
